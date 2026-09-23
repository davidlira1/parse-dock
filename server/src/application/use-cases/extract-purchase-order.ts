import { PurchaseOrderSchema } from "../../domain/purchase-order/purchase-order.schema.js";
import type { PurchaseOrder } from "../../domain/purchase-order/purchase-order.types.js";
import { AppError } from "../../errors/app-error.js";
import { logger } from "../../logger.js";
import type { DocumentInput } from "../ports/document-input.js";
import type { DocumentExtractor } from "../ports/document-extractor.js";

export class ExtractPurchaseOrder {
  constructor(private readonly extractor: DocumentExtractor) {}

  async execute(document: DocumentInput): Promise<PurchaseOrder> {
    const startedAt = Date.now();
    logger.info("extraction started", {
      mimeType: document.mimeType,
      size: document.size,
    });

    try {
      const extracted = await this.extractor.extractPurchaseOrder(document);
      const parsed = PurchaseOrderSchema.safeParse(extracted);

      if (!parsed.success) {
        logger.error("extraction failed", {
          code: "invalid_provider_response",
          elapsedMs: Date.now() - startedAt,
          fields: parsed.error.issues
            .map((issue) => issue.path.join("."))
            .join(","),
        });
        throw new AppError(
          "The document extractor returned an invalid purchase order.",
          502,
          "invalid_provider_response",
        );
      }

      logger.info("extraction completed", {
        elapsedMs: Date.now() - startedAt,
      });
      return parsed.data;
    } catch (error) {
      if (error instanceof AppError) {
        if (error.code !== "invalid_provider_response") {
          logger.error("extraction failed", {
            code: error.code,
            elapsedMs: Date.now() - startedAt,
          });
        }
        throw error;
      }

      logger.error("extraction failed", {
        code: "internal_error",
        elapsedMs: Date.now() - startedAt,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      throw new AppError(
        "Purchase order extraction failed.",
        500,
        "internal_error",
      );
    }
  }
}
