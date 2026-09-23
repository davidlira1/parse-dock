import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { loadEnv } from "../src/config/env.js";
import { PurchaseOrderSchema } from "../src/domain/purchase-order/purchase-order.schema.js";
import { GeminiDocumentExtractor } from "../src/infrastructure/ai/gemini/gemini-document-extractor.js";

dotenv.config();

const mimeTypesByExtension: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npm run extract:sample -- path/to/document.pdf");
  process.exit(1);
}

const extension = path.extname(filePath).toLowerCase();
const mimeType = mimeTypesByExtension[extension];

if (!mimeType) {
  console.error("Supported sample files: .pdf, .png, .jpg, .jpeg");
  process.exit(1);
}

try {
  const env = loadEnv();
  const buffer = await readFile(filePath);
  const extractor = new GeminiDocumentExtractor({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
    timeoutMs: env.GEMINI_TIMEOUT_MS,
  });

  const extracted = await extractor.extractPurchaseOrder({
    buffer,
    mimeType,
    originalName: path.basename(filePath),
    size: buffer.length,
  });
  const purchaseOrder = PurchaseOrderSchema.parse(extracted);

  console.log(JSON.stringify({ purchaseOrder }, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : "Extraction failed";
  console.error(message);
  process.exit(1);
}
