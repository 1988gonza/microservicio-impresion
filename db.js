// workers/clarion/db.js
import sql from "mssql";
import { wait } from "../../utils/helpers.js";
import getWorkerConfig from "./config/index.js";

const configuracion = getWorkerConfig();

const config = {
  user: configuracion.db.user,
  password: configuracion.db.pass,
  server: configuracion.db.host,
  database: configuracion.db.database,
  port: Number(configuracion.db.port),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;

// Obtener pool con reintentos infinitos
export async function getPool() {
  if (pool && pool.connected) return pool;

  let attempt = 0;

  while (!pool || !pool.connected) {
    attempt++;
    try {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log(`✅ MSSQL connected (${configuracion.env})`);
      break;
    } catch (err) {
      console.error(
        `❌ DB connection failed (attempt ${attempt}):`,
        err.message
      );
      const delay = Number(process.env.DB_RETRY_DELAY) || 5000;
      console.log(`Reintentando en ${delay / 1000}s...`);
      await wait(delay);
    }
  }

  return pool;
}
