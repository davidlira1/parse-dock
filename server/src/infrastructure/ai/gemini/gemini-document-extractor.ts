import { ApiError, GoogleGenAI } from "@google/genai";
import type { DocumentInput } from "../../../application/ports/document-input.js";
import type { DocumentExtractor } from "../../../application/ports/document-extractor.js";
import { AppError } from "../../../errors/app-error.js";
import { logger } from "../../../logger.js";
import { PURCHASE_ORDER_EXTRACTION_INSTRUCTIONS } from "./extraction-instructions.js";
import { toPurchaseOrderResponseSchema } from "./purchase-order-response-schema.js";

const PROVIDER = "gemini";
const responseSchema = toPurchaseOrderResponseSchema();

export interface GeminiDocumentExtractorConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export class GeminiDocumentExtractor implements DocumentExtractor {
  private readonly client: GoogleGenAI;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config: GeminiDocumentExtractorConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model;
    this.timeoutMs = config.timeoutMs;
  }

  async extractPurchaseOrder(document: DocumentInput): Promise<unknown> {
    const startedAt = Date.now();
    logger.info("provider request started", {
      provider: PROVIDER,
      model: this.model,
    });

    try {
      const interaction = await this.client.interactions.create(
        {
          model: this.model,
          store: false,
          system_instruction: PURCHASE_ORDER_EXTRACTION_INSTRUCTIONS,
          input: [
            {
              type: "text",
              text: "Extract the purchase order from the attached document.",
            },
            toInlineContent(document),
          ],
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: responseSchema,
          },
        },
        {
          timeout_ms: this.timeoutMs,
          retries: { strategy: "none" },
        },
      );

      if (
        interaction.status === "failed" ||
        interaction.status === "cancelled" ||
        interaction.status === "budget_exceeded"
      ) {
        throw new AppError(
          "The document extraction service is unavailable.",
          503,
          "provider_unavailable",
        );
      }

      if (interaction.status !== "completed" || !interaction.output_text) {
        throw new AppError(
          "The document extractor returned an invalid response.",
          502,
          "invalid_provider_response",
        );
      }

      const parsed = parseProviderJson(interaction.output_text);
      logger.info("provider request completed", {
        provider: PROVIDER,
        model: this.model,
        elapsedMs: Date.now() - startedAt,
      });
      return parsed;
    } catch (error) {
      const providerError =
        error instanceof AppError ? error : toProviderError(error);
      logger.error("provider request failed", {
        provider: PROVIDER,
        model: this.model,
        elapsedMs: Date.now() - startedAt,
        code: providerError.code,
        errorName: error instanceof Error ? error.name : "UnknownError",
        status: error instanceof ApiError ? error.status : null,
      });
      throw providerError;
    }
  }
}

function toInlineContent(document: DocumentInput):
  | { type: "document"; data: string; mime_type: "application/pdf" }
  | { type: "image"; data: string; mime_type: "image/png" | "image/jpeg" } {
  const data = document.buffer.toString("base64");

  if (document.mimeType === "application/pdf") {
    return { type: "document", data, mime_type: "application/pdf" };
  }

  if (document.mimeType === "image/png" || document.mimeType === "image/jpeg") {
    return { type: "image", data, mime_type: document.mimeType };
  }

  throw new AppError(
    "Unsupported file type. Upload a PDF, PNG, or JPEG.",
    400,
    "unsupported_mime_type",
  );
}

function parseProviderJson(output: string): unknown {
  try {
    return JSON.parse(output) as unknown;
  } catch {
    throw new AppError(
      "The document extractor returned an invalid response.",
      502,
      "invalid_provider_response",
    );
  }
}

function toProviderError(error: unknown): AppError {
  if (isTimeout(error) || (error instanceof ApiError && isTimeoutStatus(error.status))) {
    return new AppError(
      "The document extraction service timed out.",
      504,
      "provider_timeout",
    );
  }

  return new AppError(
    "The document extraction service is unavailable.",
    503,
    "provider_unavailable",
  );
}

function isTimeout(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "RequestTimeoutError" ||
      error.name === "TimeoutError" ||
      error.name === "AbortError")
  );
}

function isTimeoutStatus(status: number): boolean {
  return status === 408 || status === 504;
}
