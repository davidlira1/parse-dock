import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { ExtractPurchaseOrder } from "../src/application/use-cases/extract-purchase-order.js";
import { DocumentController } from "../src/http/controllers/document.controller.js";
import { FakeDocumentExtractor } from "./fake-document-extractor.js";

const purchaseOrder = {
  poNumber: "18473",
  customer: {
    name: "ABC Roofing",
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

function createTestApp(maxUploadBytes = 1024) {
  const extractor = new FakeDocumentExtractor(async () => purchaseOrder);
  const app = createApp(
    new DocumentController(new ExtractPurchaseOrder(extractor)),
    { maxUploadBytes },
  );
  return { app, extractor };
}

describe("POST /api/documents/purchase-orders/extract", () => {
  it("returns the extracted purchase order for a PDF upload", async () => {
    const { app, extractor } = createTestApp();
    const pdf = Buffer.from("%PDF-1.4 sample");

    const response = await request(app)
      .post("/api/documents/purchase-orders/extract")
      .attach("file", pdf, {
        filename: "purchase-order.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ purchaseOrder });
    expect(extractor.documents).toHaveLength(1);
    expect(extractor.documents[0]).toMatchObject({
      mimeType: "application/pdf",
      originalName: "purchase-order.pdf",
      size: pdf.length,
    });
    expect(extractor.documents[0]?.buffer.equals(pdf)).toBe(true);
  });

  it.each([
    ["purchase-order.png", "image/png"],
    ["purchase-order.jpg", "image/jpeg"],
  ])("accepts a %s upload", async (filename, contentType) => {
    const { app } = createTestApp();

    const response = await request(app)
      .post("/api/documents/purchase-orders/extract")
      .attach("file", Buffer.from("image"), {
        filename,
        contentType,
      });

    expect(response.status).toBe(200);
    expect(response.body.purchaseOrder).toEqual(purchaseOrder);
  });

  it("returns 400 when no file is supplied", async () => {
    const { app, extractor } = createTestApp();

    const response = await request(app)
      .post("/api/documents/purchase-orders/extract")
      .field("note", "missing file");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("file_required");
    expect(response.body.error.stack).toBeUndefined();
    expect(extractor.documents).toHaveLength(0);
  });

  it("returns 400 for an empty file", async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post("/api/documents/purchase-orders/extract")
      .attach("file", Buffer.alloc(0), {
        filename: "empty.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("empty_file");
  });

  it("returns 400 for an unsupported MIME type", async () => {
    const { app, extractor } = createTestApp();

    const response = await request(app)
      .post("/api/documents/purchase-orders/extract")
      .attach("file", Buffer.from("hello"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("unsupported_mime_type");
    expect(extractor.documents).toHaveLength(0);
  });

  it("returns 400 when the file exceeds the size limit", async () => {
    const { app, extractor } = createTestApp(8);

    const response = await request(app)
      .post("/api/documents/purchase-orders/extract")
      .attach("file", Buffer.alloc(32), {
        filename: "large.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("file_too_large");
    expect(extractor.documents).toHaveLength(0);
  });
});
