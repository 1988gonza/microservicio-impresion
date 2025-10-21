// services/ImpresionService.js
import { v4 as uuidv4 } from "uuid";
import {
  formatearImportesPorPath,
  replacement,
} from "@1988gonza/mi-libreria-compartida/utils/helpers.js";
import { ResponseHelper } from "@1988gonza/mi-libreria-compartida/utils/responseHelper.js";
import { createQR } from "@1988gonza/mi-libreria-compartida/utils/createQr.js";

// ===================== FUNCIONES LOCALES =====================
async function crearQRdeAfip(datos = {}) {
  const { comprobante, cliente, contratante } = datos;

  const obtenerTipoDocAFIP = (tipo) => {
    const tipos = { CUIT: 80, CUIL: 86, DNI: 96, PAS: 94 };
    return tipos[tipo] ?? 96;
  };

  try {
    const esPesos = comprobante.moneda.id == 1;

    const afip = {
      ver: "1",
      fecha: comprobante.emision.en,
      cuit: Number(contratante.cuit),
      tipoCmp: Number(comprobante.codigo),
      ptoVta: Number(comprobante.puntoDeVenta),
      nroCmp: Number(comprobante.numero.slice(-8)),
      importe: esPesos ? comprobante.importe.ars : comprobante.importe.usd,
      moneda: esPesos ? "PES" : "DOL",
      ctz: esPesos ? 1 : Number(comprobante.cotizacion),
      tipoDocRec: obtenerTipoDocAFIP(cliente.tipoDocumento),
      nroDocRec: Number(cliente.documento),
      tipoCodAut: "E",
      codAut: Number(comprobante.cae),
    };

    const payload = Buffer.from(JSON.stringify(afip)).toString("base64");
    const urlQR = `https://www.afip.gob.ar/fe/qr/?p=${payload}`;

    return await createQR(urlQR);
  } catch (error) {
    console.error("Error generando QR AFIP:", error);
    throw new Error("No se pudo generar el QR del comprobante");
  }
}

async function crearQRdeAe(hash) {
  try {
    return await createQR(hash);
  } catch (error) {
    console.error("Error generando QR AE:", error);
    throw new Error("No se pudo generar el QR del comprobante");
  }
}

function calcularSubtotales(importes) {
  const netos = importes.filter((i) =>
    ["GRAVADO", "NO GRAVADO"].includes(i.tipo?.toUpperCase())
  );

  return {
    ars: netos.reduce((sum, i) => sum + i.importe.ars, 0),
    usd: netos.reduce((sum, i) => sum + i.importe.usd, 0),
  };
}

async function generarQRs(data, configuracion) {
  if (configuracion.mostrar.codigo_afip)
    data.qrAfip = await crearQRdeAfip(data);
  if (configuracion.mostrar.codigo_qr)
    data.qrAe = await crearQRdeAe(data.comprobante.hash);
}

function debeImprimir(configuracion, comprobante) {
  if (typeof configuracion.imprimir === "boolean")
    return configuracion.imprimir;

  if (configuracion.condicion?.conceptos) {
    const idsItems = comprobante.items.map((i) => i.conceptoId);
    const hayMatch = configuracion.condicion.conceptos.some((c) =>
      idsItems.includes(c)
    );
    return hayMatch ? !!configuracion.condicion.imprimir : false;
  }

  return false;
}

// ===================== IMPRESION SERVICE =====================
export class ImpresionService {
  // Debe coincidir exactamente con el nombre de la clase exportada
  static dependencies = [
    "PdfService",
    "StorageService",
    "ContratantesService",
    "TokenService",
    "ComprobantesImpresos", // si es modelo
  ];

  constructor({
    PdfService,
    StorageService,
    ContratantesService,
    TokenService,
    ComprobantesImpresos,
    config,
  }) {
    this.pdfService = PdfService;
    this.storageService = StorageService;
    this.contratanteService = ContratantesService;
    this.tokenService = TokenService;
    this.comprobantesImpresosModel = ComprobantesImpresos;
    this.config = config;
  }

  async controlDeDuplicidad(datos) {
    try {
      const {
        id: id_comprobante,
        contratante: id_contratante,
        transaccion: transaccion_id,
        comprobante: {
          tipo,
          hash,
          emision: { en: fecha },
        },
      } = datos;

      const inserted = await this.comprobantesImpresosModel.create({
        id_comprobante,
        id_contratante,
        transaccion_id,
        tipo,
        hash,
        fecha,
        datos,
      });

      return ResponseHelper.success({
        message: "Comprobante registrado",
        data: inserted,
      });
    } catch (error) {
      if (error.code === "23505") {
        return ResponseHelper.error({
          message: "El comprobante ya fue impreso",
          status: 409,
          data: datos,
          code: "DUPLICATE_KEY",
        });
      }

      return ResponseHelper.error({
        message: "Error inesperado al registrar comprobante",
        status: 500,
        code: "INTERNAL_ERROR",
        data: datos,
        detail: error.message,
      });
    }
  }

  async confirmarImpresion({ nombre_archivo, ruta_archivo, hash } = {}) {
    try {
      if (!hash) {
        return ResponseHelper.error({
          message: "Hash requerido para confirmar impresión",
          status: 400,
          code: "MISSING_HASH",
        });
      }

      const updated = await this.comprobantesImpresosModel.updateStateByHash({
        nombre_archivo,
        ruta_archivo,
        hash,
      });

      if (!updated) {
        return ResponseHelper.error({
          message: "No se encontró un comprobante con ese hash",
          status: 404,
          code: "NOT_FOUND",
        });
      }

      return ResponseHelper.success({
        message: "Comprobante impreso correctamente",
        data: updated,
      });
    } catch (error) {
      return ResponseHelper.error({
        message: "Error inesperado al confirmar la impresión",
        status: 500,
        code: "INTERNAL_ERROR",
        data: { hash, nombre_archivo, ruta_archivo },
        detail: error.message,
      });
    }
  }

  async imprimir({ data, save = true, tipoDeImpresion = "comprobante" }) {
    console.log(data, "data recibida en imprimir");

    const resultadoControl = await this.controlDeDuplicidad(data);
    console.log(resultadoControl, "resultadoControl");

    // si hubo error (ej: duplicado) corto acá
    if (!resultadoControl.success) return resultadoControl;

    const dataPreparada = await this._prepararDatos(data);

    if (!debeImprimir(dataPreparada.configuracion, dataPreparada.comprobante)) {
      return { success: false, motivo: "No imprimir" };
    }

    const html = await this._renderizarHTML(dataPreparada, tipoDeImpresion);
    const pdfBuffer = await this.pdfService.generarPDF({ html });

    const { nombreArchivo, rutaFinal, token } = save
      ? await this._guardarPDFyGenerarToken(dataPreparada, pdfBuffer)
      : { nombreArchivo: null, rutaFinal: null };

    await this.confirmarImpresion({
      nombre_archivo: nombreArchivo,
      ruta_archivo: rutaFinal,
      hash: dataPreparada.comprobante.hash,
    });

    return ResponseHelper.success({
      message: "PDF creado correctamente",
      data: { nombreArchivo, save, token },
    });
  }

  async obtenerPdfPorToken(token) {
    const ruta = await this.tokenService.verificarToken(token);
    if (!ruta)
      return ResponseHelper.error({ message: "Token inválido", status: 403 });

    const buffer = await this.storageService.leerArchivo(ruta);
    return buffer;
  }

  /**
   * Busca en DB la ruta real del comprobante por su hash
   */
  async obtenerPdfPorHash(hash) {
    const comprobante = await this.comprobantesImpresosModel.findById(hash);
    if (!comprobante) {
      return ResponseHelper.error({
        message: "No se encontró el comprobante",
        status: 404,
        code: "NOT_FOUND_ERROR",
      });
    }

    const buffer = await this.storageService.leerArchivo(
      comprobante.ruta_archivo
    );
    return buffer;
  }

  async descargar({ token, hash }) {
    if (!token && !hash) {
      return ResponseHelper.error({
        message: "Falta el token o el hash",
        status: 400,
        code: "VALIDATION_ERROR",
      });
    }

    const buffer = await this._obtenerBuffer(token, hash);
    if (!buffer) {
      return ResponseHelper.error({
        message: "PDF no encontrado",
        status: 404,
        code: "NOT_FOUND",
      });
    }

    return ResponseHelper.success({
      message: "PDF encontrado",
      data: buffer,
    });
  }

  async _obtenerBuffer(token, hash) {
    if (token) return await this.obtenerPdfPorToken(token);
    if (hash) return await this.obtenerPdfPorHash(hash);
    return null;
  }

  async _prepararDatos(data) {
    const subtotales = calcularSubtotales(data.importes);
    const wrapper = await this.contratanteService.obtenerDatosContratante(
      data.contratante
    );
    const contratante = wrapper.impresion;
    const configuracion = wrapper.obtenerConfiguracionParaImpresion({
      idRepresentado: data.representado,
      tipoDeComprobante: data.comprobante.tipo,
    });

    const dataProcesada = { ...data, subtotales, contratante };

    await generarQRs(dataProcesada, configuracion);
    this._aplicarAjustesPYMEyLeyendas(dataProcesada, configuracion);

    const paths = [
      "comprobante.importe.ars",
      "comprobante.importe.usd",
      "comprobante.cotizacion",
      "items.unitario.ars",
      "items.unitario.usd",
      "items.importe.usd",
      "items.importe.ars",
      "importes.importe.ars",
      "importes.importe.usd",
      "subtotales.ars",
      "subtotales.usd",
      "leyendas.cotizacion",
    ];

    const formateado = formatearImportesPorPath(dataProcesada, paths);
    const actualizados = replacement(configuracion, formateado);

    return { ...dataProcesada, ...formateado, ...actualizados, configuracion };
  }

  _aplicarAjustesPYMEyLeyendas(data, configuracion) {
    if (data.comprobante.pyme)
      data.comprobante.descripcion = configuracion.mostrar.pyme.nombre;

    if (configuracion.leyendas?.ae) {
      let aeList = [...(configuracion.leyendas.ae.default ?? [])];
      (configuracion.leyendas.ae.condiciones ?? []).forEach((cond) => {
        if (
          cond.terminal ===
          data.comprobante.adicionales.terminal.lugarDeDevolucion
        ) {
          aeList.push(...cond.leyendas);
        }
      });
      configuracion.leyendas.ae.default = aeList;
    }
  }

  _renderizarHTML(data, tipoDeImpresion) {
    const metadata = this._armarMetadata(tipoDeImpresion, data);
    return this.pdfService.renderizarPlantilla({ metadata, data });
  }

  async _guardarPDFyGenerarToken(data, buffer) {
    const carpeta = await this.storageService.crearCarpeta({
      fecha: data.comprobante.emision.en,
      transaccion: data.transaccion,
    });

    const nombreArchivo = `${data.comprobante.tipo}-${
      data.comprobante.numero
    }.${uuidv4()}.pdf`;
    const rutaFinal = await this.storageService.guardarPDF({
      carpeta,
      nombre: nombreArchivo,
      pdf: buffer,
    });

    const token = await this.tokenService.generarToken(rutaFinal);
    return { nombreArchivo, token, rutaFinal };
  }

  _armarMetadata(tipoDocumento, data) {
    const {
      comprobante: { tipo },
    } = data;

    switch (tipoDocumento) {
      case "comprobante":
        return {
          plantilla:
            tipo === "AE"
              ? "ae.html"
              : tipo === "RC"
              ? "rc.html"
              : tipo === "DV"
              ? "dv.html"
              : "index.html",
        };
      case "boleta":
        return { plantilla: "boleta.html" };
      case "certificado":
        return { plantilla: "certificado.html" };
      default:
        throw new Error(`Tipo de documento desconocido: ${tipoDocumento}`);
    }
  }
}
