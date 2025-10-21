import puppeteer from "puppeteer";

let browserInstance = null; // Instancia global
let closeTimeout = null;

// Detecta si estás corriendo en Render
const isRender = process.env.RENDER === "true";

/**
 * Obtiene la instancia del navegador
 */
export const getBrowser = async () => {
  if (!browserInstance) {
    try {
      browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-extensions",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-translate",
          "--disable-hardware-acceleration",
          "--mute-audio",
        ],
      });

      console.log(
        `🟢 Browser lanzado correctamente. Entorno: ${
          isRender ? "Render" : "Local"
        }`
      );
    } catch (error) {
      console.error("❌ Error al crear la instancia del navegador:", error);
    }
  }

  return browserInstance;
};

/**
 * Cierra el navegador manualmente
 */
export const closeBrowser = async () => {
  if (browserInstance) {
    console.log("🚪 Cerrando Chromium manualmente...");
    await browserInstance.close();
    browserInstance = null;
  }
};

/**
 * Programa cierre automático por inactividad
 * @param {number} timeout Tiempo en ms (default 10 minutos)
 */
export const scheduleBrowserClose = (timeout = 600000) => {
  if (closeTimeout) clearTimeout(closeTimeout);

  closeTimeout = setTimeout(async () => {
    if (browserInstance) {
      console.log("⏳ Cerrando instancia de Chromium por inactividad...");
      await browserInstance.close();
      browserInstance = null;
    }
  }, timeout);
};

// Maneja cierre en salida del proceso
process.on("exit", async () => {
  if (browserInstance) {
    await browserInstance.close();
    console.log("🔚 Chromium cerrado por salida del proceso");
  }
});

process.on("SIGINT", async () => process.exit());
process.on("SIGTERM", async () => process.exit());
