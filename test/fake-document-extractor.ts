import type { DocumentInput } from "../src/application/ports/document-input.js";
import type { DocumentExtractor } from "../src/application/ports/document-extractor.js";

export class FakeDocumentExtractor implements DocumentExtractor {
  readonly documents: DocumentInput[] = [];

  constructor(private readonly respond: (document: DocumentInput) => Promise<unknown>) {}

  extractPurchaseOrder(document: DocumentInput): Promise<unknown> {
    this.documents.push(document);
    return this.respond(document);
  }
}
