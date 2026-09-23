import type { DocumentInput } from "./document-input.js";

export interface DocumentExtractor {
  extractPurchaseOrder(document: DocumentInput): Promise<unknown>;
}
