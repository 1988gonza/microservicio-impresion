import { ResponseHelper } from "@1988gonza/mi-libreria-compartida/utils/responseHelper.js";

export class ImpresionController {
  // Dependencias inyectadas por el bootstrap
  static dependencies = ["impresionService"];

  // Rutas expuestas automáticamente
  static routes = {
    generar: { path: "/impresion/generar", verb: ["post"] },
    descargar: { path: "/impresion/descargar", verb: ["post"] },
  };

  constructor({ impresionService }) {
    this.impresionService = impresionService;
  }

  // --- IMPRIMIR PDF ---
  async generar(req) {
    const { data, save = true, tipoDeImpresion = "comprobante" } = req.body;

    if (!data) {
      return ResponseHelper.error({
        message: "Faltan datos para generar el PDF",
        code: "VALIDATION_ERROR",
        status: 400,
      });
    }

    const result = await this.impresionService.imprimir({
      data,
      save,
      tipoDeImpresion,
    });

    return ResponseHelper.success({
      data: result,
    });
  }

  async descargar(req) {
    const { token, hash } = req.body;
    return await this.impresionService.descargar({ token, hash });
  }
}
