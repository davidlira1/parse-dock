import { ExtractPurchaseOrder } from "./application/use-cases/extract-purchase-order.js";
import type { Env } from "./config/env.js";
import { DocumentController } from "./http/controllers/document.controller.js";
import { GeminiDocumentExtractor } from "./infrastructure/ai/gemini/gemini-document-extractor.js";

export function composeApplication(env: Env): {
  documentController: DocumentController;
  maxUploadBytes: number;
} {
  const extractor = new GeminiDocumentExtractor({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
    timeoutMs: env.GEMINI_TIMEOUT_MS,
  });
  const extractPurchaseOrder = new ExtractPurchaseOrder(extractor);
  const documentController = new DocumentController(extractPurchaseOrder);

  return {
    documentController,
    maxUploadBytes: env.MAX_UPLOAD_BYTES,
  };
}
