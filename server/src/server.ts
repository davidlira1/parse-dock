import dotenv from "dotenv";
import { createApp } from "./app.js";
import { composeApplication } from "./composition.js";
import { loadEnv } from "./config/env.js";
import { logger } from "./logger.js";

dotenv.config();

try {
  const env = loadEnv();
  const { documentController, maxUploadBytes } = composeApplication(env);
  const app = createApp(documentController, { maxUploadBytes });

  app.listen(env.PORT, () => {
    logger.info("server started", { port: env.PORT });
  });
} catch (error) {
  logger.error("startup failed", {
    message: error instanceof Error ? error.message : "Invalid configuration",
  });
  process.exit(1);
}
