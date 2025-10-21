import puppeteer from "puppeteer";

// Variable global para la instancia del navegador
let browserInstance = null;
let closeTimeout = null;

// Configuración de Puppeteer para usar un directorio de cache dentro del proyecto
const puppeteerConfig = {
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
};

console.log(puppeteerConfig, "puppeteerConfig");

// Función para obtener la instancia del navegador
export const getBrowser = async () => {
  if (!browserInstance) {
    try {
      browserInstance = await puppeteer.launch(puppeteerConfig);
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
