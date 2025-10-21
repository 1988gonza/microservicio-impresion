import puppeteer from "puppeteer";

let browserInstance = null;

// Detecta si estamos en Render
const isRender = process.env.RENDER === "true";

export const getBrowser = async () => {
  if (!browserInstance) {
    try {
      const launchOptions = {
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
      };

      // Si estamos en Render, usar Chromium del cache
      if (isRender) {
        const { executablePath } = await import("puppeteer");
        launchOptions.executablePath = executablePath();
      }

      browserInstance = await puppeteer.launch(launchOptions);
      console.log("✅ Chromium iniciado correctamente");
    } catch (error) {
      console.error("❌ Error al crear Chromium:", error);
    }
  }

  return browserInstance;
};

// Cerrar manualmente si se necesita
export const closeBrowser = async () => {
  if (browserInstance) {
    console.log("🚪 Cerrando Chromium manualmente...");
    await browserInstance.close();
    browserInstance = null;
  }
};

// Asegura cierre al terminar el proceso
process.on("exit", async () => {
  if (browserInstance) {
    await browserInstance.close();
    console.log("🔚 Chromium cerrado por salida del proceso");
  }
});

process.on("SIGINT", async () => process.exit());
process.on("SIGTERM", async () => process.exit());
