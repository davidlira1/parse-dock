import type { PurchaseOrder, PurchaseOrderItem } from "../types/purchase-order";

const ERROR_MESSAGES: Record<string, string> = {
  file_required: "Choose a purchase order to process.",
  empty_file: "The selected file is empty.",
  unsupported_mime_type: "Upload a PDF, PNG, or JPEG.",
  file_too_large: "This file is larger than 10 MB.",
  invalid_upload: "We couldn't read that upload. Try a PDF, PNG, or JPEG.",
  invalid_provider_response:
    "We couldn't read the purchase order details from this document.",
  provider_unavailable: "The extraction service is temporarily unavailable.",
  provider_timeout: "Processing took too long. Try the document again.",
  internal_error: "Something went wrong while processing this document.",
  network_error:
    "ParseDock couldn't reach the server. Check that it is running and try again.",
  invalid_response: "The server returned an unexpected response.",
};

const FALLBACK_MESSAGE = "We couldn't process this document.";

export class DocumentApiError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "DocumentApiError";
    this.code = code;
  }
}

export function messageForDocumentError(error: unknown): string {
  if (error instanceof DocumentApiError) {
    return ERROR_MESSAGES[error.code] ?? FALLBACK_MESSAGE;
  }

  return FALLBACK_MESSAGE;
}

export async function extractPurchaseOrder(file: File): Promise<PurchaseOrder> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/documents/purchase-orders/extract", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new DocumentApiError("network_error");
  }

  const body: unknown = await readJson(response);

  if (!response.ok) {
    throw new DocumentApiError(errorCodeFromBody(body));
  }

  if (!isRecord(body) || !isPurchaseOrder(body.purchaseOrder)) {
    throw new DocumentApiError("invalid_response");
  }

  return body.purchaseOrder;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorCodeFromBody(body: unknown): string {
  if (!isRecord(body) || !isRecord(body.error)) {
    return "invalid_response";
  }

  return typeof body.error.code === "string" ? body.error.code : "invalid_response";
}

function isPurchaseOrder(value: unknown): value is PurchaseOrder {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return false;
  }

  return (
    isNullableString(value.poNumber) &&
    hasNullableStrings(value.customer, ["name", "contactName", "email", "phone"]) &&
    hasNullableStrings(value.project, ["name", "jobNumber"]) &&
    isNullableString(value.orderDate) &&
    isNullableString(value.requestedDeliveryDate) &&
    hasNullableStrings(value.shipTo, ["address", "city", "state", "zip"]) &&
    value.items.every(isPurchaseOrderItem) &&
    isNullableNumber(value.subtotal) &&
    isNullableNumber(value.tax) &&
    isNullableNumber(value.total)
  );
}

function isPurchaseOrderItem(value: unknown): value is PurchaseOrderItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNullableString(value.sku) &&
    isNullableString(value.description) &&
    isNullableNumber(value.quantity) &&
    isNullableString(value.unit) &&
    isNullableNumber(value.unitPrice) &&
    isNullableNumber(value.totalPrice)
  );
}

function hasNullableStrings(value: unknown, keys: string[]): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return keys.every((key) => isNullableString(value[key]));
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
