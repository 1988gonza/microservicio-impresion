import puppeteer from "puppeteer";

let browserInstance = null; // Variable global para la instancia del navegador
let closeTimeout = null;

/** args: [
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
        ], */

// Función para obtener la instancia del navegador
export const getBrowser = async () => {
  if (!browserInstance) {
    try {
      browserInstance = await puppeteer.launch({
        headless: true, // Establecer en true o false según tu necesidad
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
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
