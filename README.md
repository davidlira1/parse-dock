# ParseDock

ParseDock receives a business document and extracts structured purchase-order data from it. Upload a PDF, PNG, or JPEG, review the extracted fields in the browser, and confirm locally.

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
    ↓
editable review UI
```

## Repository layout

```
parse-dock/
├── client/   React + Vite frontend
└── server/   Node + Express API
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

### Server

```bash
cd server
npm install
cp .env.example .env
```

Set `GEMINI_API_KEY` in `server/.env`. The server will not start without it.

### Client

```bash
cd client
npm install
```

## Run locally

Start the API and the UI in separate terminals.

**Terminal 1 — API (port 3000):**

```bash
cd server
npm run dev
```

**Terminal 2 — UI (port 5173):**

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:3000`, so the browser talks to the UI origin only.

Make sure nothing else is already listening on port 3000. If another app is using that port, either stop it or change `PORT` in `server/.env` and update the proxy target in `client/vite.config.ts`.

## UI workflow

1. Upload a purchase order (PDF, PNG, or JPEG, up to 10 MB).
2. Click **Process Document** to send the file to the extraction API.
3. Review the extracted fields on the review screen. The original document appears beside the form on wide screens so you can compare side by side.
4. Edit any field as needed. Empty numeric fields stay `null`; money fields format when you leave the field.
5. Click **Confirm Purchase Order**. Confirmation stays on the page and is not saved to a backend.
6. Click **Process Another Document** to start over.

Production build for the client:

```bash
cd client
npm run build
npm run preview
```

## Environment variables

Server configuration lives in `server/.env`:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | HTTP port |
| `GEMINI_API_KEY` | Yes | | Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Model used for extraction |
| `GEMINI_TIMEOUT_MS` | No | `60000` | Provider request timeout |
| `MAX_UPLOAD_BYTES` | No | `10485760` | Maximum upload size (10 MB) |

## API

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

## Server scripts

From `server/`:

```bash
npm run dev      # development with reload
npm run build    # compile TypeScript
npm start        # run compiled output
npm test         # unit and HTTP tests (no Gemini)
```

To try a real document after `GEMINI_API_KEY` is set:

```bash
npm run extract:sample -- path/to/purchase-order.pdf
```

That script is manual and is not part of `npm test`.
