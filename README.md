# ParseDock Server

ParseDock receives a business document and extracts structured purchase-order data from it. This milestone is the backend only:

```
PDF / image
    ↓
HTTP upload
    ↓
document validation
    ↓
AI document extractor
    ↓
structured PurchaseOrder
    ↓
schema validation
    ↓
JSON response
```

The HTTP and application layers depend on a `DocumentExtractor` interface. Gemini is one implementation of that interface, selected in the composition root. Replacing Gemini later means adding a new adapter and changing that wiring. Routes, the controller, the `ExtractPurchaseOrder` use case, and the purchase-order schema stay the same.

```
HTTP
 ↓
Controller
 ↓
ExtractPurchaseOrder
 ↓
DocumentExtractor
 ↓
GeminiDocumentExtractor
 ↓
Gemini API
```

The Gemini adapter calls the Interactions API. It sends the upload inline and requests JSON that matches the purchase-order schema.

## Setup

Requires Node.js 20 or later.

```bash
cd server
npm install
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env`. The server will not start without it.

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | HTTP port |
| `GEMINI_API_KEY` | Yes | | Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Model used for extraction |
| `GEMINI_TIMEOUT_MS` | No | `60000` | Provider request timeout |
| `MAX_UPLOAD_BYTES` | No | `10485760` | Maximum upload size (10 MB) |

## Start the server

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Endpoint

`POST /api/documents/purchase-orders/extract`

- Content type: `multipart/form-data`
- Field name: `file`
- Supported types: `application/pdf`, `image/png`, `image/jpeg`

```bash
curl -X POST http://localhost:3000/api/documents/purchase-orders/extract \
  -F "file=@purchase-order.pdf;type=application/pdf"
```

A successful response looks like:

```json
{
  "purchaseOrder": {
    "poNumber": "18473",
    "customer": {
      "name": "ABC Roofing",
      "contactName": "John Smith",
      "email": null,
      "phone": null
    },
    "project": {
      "name": "Wilshire Medical Center",
      "jobNumber": "WMC-2041"
    },
    "orderDate": "2026-09-22",
    "requestedDeliveryDate": "2026-09-28",
    "shipTo": {
      "address": "1450 Wilshire Blvd",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90017"
    },
    "items": [
      {
        "sku": null,
        "description": "24ga Galvanized Sheet",
        "quantity": 40,
        "unit": null,
        "unitPrice": 82.5,
        "totalPrice": 3300
      }
    ],
    "subtotal": 3300,
    "tax": null,
    "total": 3300
  }
}
```

Failures return `{ "error": { "code": "...", "message": "..." } }` with an HTTP status such as 400 for a bad upload, 502 for an invalid provider response, 503 when the provider is unavailable, or 504 on timeout.

## Tests

Automated tests do not call Gemini.

```bash
npm test
```

To try a real document after `GEMINI_API_KEY` is set:

```bash
npm run extract:sample -- path/to/purchase-order.pdf
```

That script is manual and is not part of `npm test`.
