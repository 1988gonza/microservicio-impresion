import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

let browserInstance = null;
let closeTimeout = null;

const isRender =
  process.env.RENDER === "true" || process.env.RENDER_EXTERNAL_URL;

// 🧠 Función para obtener el path correcto de Chrome en Render
const getRenderChromePath = () => {
  try {
    const basePath = "/opt/render/.cache/puppeteer/chrome";
    if (!fs.existsSync(basePath)) {
      console.warn("⚠️ No se encontró la carpeta base de Chrome en Render.");
      return null;
    }

    const versions = fs.readdirSync(basePath);
    if (!versions.length) {
      console.warn("⚠️ No se encontró ninguna versión de Chrome en Render.");
      return null;
    }

    const latestVersion = versions[0]; // usa la primera carpeta encontrada (por ej. 141.0.7390.78)
    const chromePath = path.join(
      basePath,
      latestVersion,
      "chrome-linux64/chrome"
    );

    console.log(`🧩 Chrome detectado en Render: ${chromePath}`);
    return chromePath;
  } catch (err) {
    console.error("❌ Error detectando Chrome en Render:", err);
    return null;
  }
};

// 🚀 Obtener instancia del navegador
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

      // 🔍 Si estamos en Render, usamos el path detectado
      if (isRender) {
        const chromePath = getRenderChromePath();
        if (chromePath) launchOptions.executablePath = chromePath;
      }

      browserInstance = await puppeteer.launch(launchOptions);
      console.log(
        `✅ Instancia de Chromium creada correctamente en ${
          isRender ? "Render" : "Local"
        }.`
      );
    } catch (error) {
      console.error("❌ Error al crear la instancia del navegador:", error);
    }
  }

  return browserInstance;
};

// 🚪 Cierre manual del navegador
export const closeBrowser = async () => {
  if (browserInstance) {
    console.log("🚪 Cerrando Chromium manualmente...");
    await browserInstance.close();
    browserInstance = null;
  }
};

// ⏳ Cierre automático por inactividad
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

// 🔚 Cierre seguro cuando se termina el proceso
process.on("exit", async () => {
  if (browserInstance) {
    await browserInstance.close();
    console.log("🔚 Chromium cerrado por salida del proceso");
  }
});

process.on("SIGINT", async () => {
  process.exit(); // Dispara el evento 'exit'
});
