import { Router } from "express";
import { DocumentController } from "../controllers/document.controller.js";
import { createUploadMiddleware } from "../middleware/upload.middleware.js";

export function createDocumentRouter(
  documentController: DocumentController,
  maxUploadBytes: number,
): Router {
  const router = Router();
  router.post(
    "/purchase-orders/extract",
    createUploadMiddleware(maxUploadBytes),
    documentController.extract,
  );
  return router;
}
