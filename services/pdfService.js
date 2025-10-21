import { getBrowser } from "../browser.js";
import path from "node:path";
import { __dirname } from "../utils/paths.js";
import { readFile } from "node:fs/promises";
import { render } from "ejs";

export class PdfService {
  constructor(basePath = "pdfs_internos") {
    this.basePath = basePath;
    this.templateCache = {};
  }

  async renderizarPlantilla({ metadata, data }) {
    const { plantilla } = metadata;
    if (!plantilla)
      throw new Error("No se especificó la plantilla en metadata");

    const templateName = path.basename(plantilla);

    if (!this.templateCache[templateName]) {
      try {
        const pathTemplate = path.join(
          __dirname,
          "..",
          "views",
          "comprobantes",
          plantilla
        );
        const content = await readFile(pathTemplate, "utf8");
        this.templateCache[templateName] = content;
      } catch (err) {
        throw new Error(
          `No se pudo cargar la plantilla ${templateName}: ${err.message}`
        );
      }
    }

    try {
      return render(this.templateCache[templateName], data); // render puede ser ejs, mustache, etc.
    } catch (err) {
      throw new Error(
        `Error renderizando la plantilla ${templateName}: ${err.message}`
      );
    }
  }

  async generarPDF({
    html,
    options = {
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      landscape: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  } = {}) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const buffer = await page.pdf({
      ...options,
    });

    await page.close();
    return buffer; // devuelvo el buffer, no escribo en disco
  }
}
