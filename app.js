import express from "express";
import cors from "cors";

import getConfig from "./config/index.js";
import { initBootstrap } from "@1988gonza/mi-libreria-compartida/bootstrap.js";
import { mountRoutes } from "@1988gonza/mi-libreria-compartida/utils/autoRoutes.js";
import { __dirname } from "./utils/paths.js";
import path from "node:path";
import { getBrowser } from "./browser.js";

// Importar todo desde index.js de cada carpeta
import * as models from "./models/index.js";
import * as services from "./services/index.js";
import * as controllers from "./controllers/index.js";

async function main() {
  const config = getConfig();
  const rootDir = path.resolve(__dirname, "..");

  // -----------------------------
  // Inicializamos TokenService
  // -----------------------------
  const tokenService = new services.TokenService(
    path.join(rootDir, "private.pem"),
    path.join(rootDir, "public.pem")
  );

  // Inicializa todos los servicios y controladores
  const mainBootstrap = await initBootstrap({
    config,
    models,
    services,
    controllers,
  });

  // ⚡ Esperamos a que las keys estén listas
  await tokenService.initKeys();

  // -----------------------------
  // Configuración Express
  // -----------------------------
  const app = express();
  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ limit: "500mb", extended: true }));
  app.use(cors());
  // Monta rutas automáticamente desde los controladores

  mountRoutes(app, mainBootstrap.controllers);

  // Inicializa browser si es necesario
  await getBrowser();

  // Endpoint de monitoreo
  app.get("/status", (req, res) => {
    res.json({ running: true, env: config.env });
  });

  // Inicia el servidor
  app.listen(config.port, () => {
    console.log(
      `[Micro Impresion] Servidor corriendo en http://localhost:${config.port}`
    );
    console.log(`[Micro Impresion] Entorno: ${config.env}`);
  });
}

main().catch((err) => {
  console.error("Error al iniciar microservicio de impresión:", err);
  process.exit(1);
});
