import express from "express";
import { DocumentController } from "./http/controllers/document.controller.js";
import { errorMiddleware } from "./http/middleware/error.middleware.js";
import { createDocumentRouter } from "./http/routes/document.routes.js";

export function createApp(
  documentController: DocumentController,
  options: { maxUploadBytes: number },
): express.Express {
  const app = express();
  app.use(
    "/api/documents",
    createDocumentRouter(documentController, options.maxUploadBytes),
  );
  app.use(errorMiddleware);
  return app;
}
