import { mkdir, copyFile, writeFile, readFile } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import path from "path";
import archiver from "archiver";
import { __dirname } from "mi-libreria-compartida/utils/paths.js";

export class StorageService {
  constructor(baseContratante = "pdfs_contratantes") {
    this.baseContratante = baseContratante;
  }

  async crearCarpeta({ fecha, transaccion, ruta = "pdf" } = {}) {
    const [año, mes, dia] = fecha.split("-");
    const carpeta = path.join(ruta, año, mes, dia, String(transaccion));
    await mkdir(carpeta, { recursive: true });
    return carpeta;
  }

  async guardarPDF({ carpeta, nombre, pdf } = {}) {
    const rutaArchivo = path.join(carpeta, nombre);
    await writeFile(rutaArchivo, pdf);
    return rutaArchivo;
  }

  async crearRutaContratante(archivo, fecha_creacion) {
    const [año, mes, dia] = fecha_creacion.split("T")[0].split("-");
    const carpeta = path.join(
      this.baseContratante,
      archivo.contratante_id,
      archivo.punto_venta,
      año,
      mes,
      dia,
      archivo.tipo
    );
    await mkdir(carpeta, { recursive: true });
    return path.join(carpeta, archivo.nombre);
  }

  async copiarAContratante(archivo, rutaContratante) {
    await copyFile(archivo.ruta_interna, rutaContratante);
  }

  async generarZIP(archivos, zipPath) {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => resolve(zipPath));
      archive.on("error", (err) => reject(err));

      archive.pipe(output);

      for (const a of archivos) {
        archive.file(a.ruta_contratante, { name: a.nombre });
      }

      archive.finalize();
    });
  }

  //  Leer archivo completo en memoria (Buffer)
  async leerArchivo(rutaCompleta) {
    const ruta = path.join(__dirname, "..", rutaCompleta);
    return await readFile(ruta);
  }

  //  Crear stream de lectura (para descargar/streaming)
  obtenerStream(rutaCompleta) {
    return createReadStream(rutaCompleta);
  }
}
