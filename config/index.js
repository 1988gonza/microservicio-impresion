import dotenv from "dotenv";
import path from "path";

export default function getWorkerConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";

  // cargamos el .env específico del worker
  dotenv.config({ path: path.resolve(`.env.${nodeEnv}`) });

  return {
    db: {
      user: process.env.DB_USER,
      pass: process.env.DB_PASSWORD,
      host: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
    },
    pg: {
      user: process.env.PG_USER,
      pass: process.env.PG_PASSWORD,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT,
    },
    workers: {
      abonadas: process.env.WORKER_ABONADAS_URL,
      mail: process.env.WORKER_MAIL_URL,
    },
    mail: {
      from: process.env.MAIL_FROM,
      admins: process.env.MAIL_ADMINS,
    },
    port: process.env.APP_PORT,
    env: nodeEnv,
    debug: process.env.DEBUG === "true" || false,
  };
}
