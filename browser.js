import puppeteer from "puppeteer";
import { executablePath } from "puppeteer";

const isRender =
  process.env.RENDER === "true" || process.env.RENDER_EXTERNAL_URL;

console.log(isRender, "isRender");

let browserInstance = null; // Variable global para la instancia del navegador
let closeTimeout = null;

// Función para obtener la instancia del navegador
export const getBrowser = async () => {
  if (!browserInstance) {
    try {
      browserInstance = await puppeteer.launch({
        headless: true, // Establecer en true o false según tu necesidad
        executablePath: isRender ? executablePath() : undefined, // 👈 solo en Render
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
        "Se esta llamando al browser del services, instancia creada correctamente."
      );
    } catch (error) {
      console.error("Error al crear la instancia del navegador:", error);
    }
  }

  return browserInstance;
};

// Cerrar manualmente el navegador
export const closeBrowser = async () => {
  if (browserInstance) {
    console.log("🚪 Cerrando Chromium manualmente...");
    await browserInstance.close();
    browserInstance = null;
  }
};

// Función para cerrar el navegador después de cierto tiempo de inactividad
export const scheduleBrowserClose = (timeout = 6000000) => {
  if (closeTimeout) clearTimeout(closeTimeout);

  closeTimeout = setTimeout(async () => {
    if (browserInstance) {
      console.log("⏳ Cerrando instancia de Chromium por inactividad...");
      await browserInstance.close();
      browserInstance = null;
    }
  }, timeout);
};

process.on("exit", async () => {
  if (browserInstance) {
    await browserInstance.close();
    console.log("🔚 Chromium cerrado por salida del proceso");
  }
});

process.on("SIGINT", async () => {
  process.exit(); // Triggea el 'exit'
});
