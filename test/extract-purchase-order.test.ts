import { describe, expect, it } from "vitest";
import type { DocumentInput } from "../src/application/ports/document-input.js";
import { ExtractPurchaseOrder } from "../src/application/use-cases/extract-purchase-order.js";
import type { PurchaseOrder } from "../src/domain/purchase-order/purchase-order.types.js";
import { AppError } from "../src/errors/app-error.js";
import { FakeDocumentExtractor } from "./fake-document-extractor.js";

const document: DocumentInput = {
  buffer: Buffer.from("%PDF-1.4"),
  mimeType: "application/pdf",
  originalName: "purchase-order.pdf",
  size: 8,
};

const validPurchaseOrder: PurchaseOrder = {
  poNumber: "18473",
  customer: {
    name: "ABC Roofing",
    contactName: "John Smith",
    email: null,
    phone: null,
  },
  project: {
    name: "Wilshire Medical Center",
    jobNumber: "WMC-2041",
  },
  orderDate: "2026-09-22",
  requestedDeliveryDate: "2026-09-28",
  shipTo: {
    address: "1450 Wilshire Blvd",
    city: "Los Angeles",
    state: "CA",
    zip: "90017",
  },
  items: [
    {
      sku: null,
      description: "24ga Galvanized Sheet",
      quantity: 40,
      unit: null,
      unitPrice: 82.5,
      totalPrice: 3300,
    },
  ],
  subtotal: 3300,
  tax: null,
  total: 3300,
};

const emptyPurchaseOrder: PurchaseOrder = {
  poNumber: null,
  customer: {
    name: null,
    contactName: null,
    email: null,
    phone: null,
  },
  project: {
    name: null,
    jobNumber: null,
  },
  orderDate: null,
  requestedDeliveryDate: null,
  shipTo: {
    address: null,
    city: null,
    state: null,
    zip: null,
  },
  items: [],
  subtotal: null,
  tax: null,
  total: null,
};

describe("ExtractPurchaseOrder", () => {
  it("returns a validated purchase order", async () => {
    const extractor = new FakeDocumentExtractor(async () => validPurchaseOrder);
    const useCase = new ExtractPurchaseOrder(extractor);

    await expect(useCase.execute(document)).resolves.toEqual(validPurchaseOrder);
    expect(extractor.documents).toEqual([document]);
  });

  it("accepts null fields", async () => {
    const useCase = new ExtractPurchaseOrder(
      new FakeDocumentExtractor(async () => emptyPurchaseOrder),
    );

    await expect(useCase.execute(document)).resolves.toEqual(emptyPurchaseOrder);
  });

  it("rejects an extractor result that does not match the schema", async () => {
    const useCase = new ExtractPurchaseOrder(
      new FakeDocumentExtractor(async () => ({ poNumber: 18473 })),
    );

    await expect(useCase.execute(document)).rejects.toMatchObject({
      name: "AppError",
      statusCode: 502,
      code: "invalid_provider_response",
    });
  });

  it("propagates an extractor failure as a controlled application error", async () => {
    const failure = new AppError(
      "The document extraction service is unavailable.",
      503,
      "provider_unavailable",
    );
    const useCase = new ExtractPurchaseOrder(
      new FakeDocumentExtractor(async () => {
        throw failure;
      }),
    );

    await expect(useCase.execute(document)).rejects.toBe(failure);
  });
});
