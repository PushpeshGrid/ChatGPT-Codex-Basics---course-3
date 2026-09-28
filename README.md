# Checkout Service

A small Next.js e-commerce checkout application for AI coding-agent training.

**No cloud services (PostgreSQL, MongoDB, Firebase, etc.), no Docker. Orders are persisted locally in `data/orders.json` using Node.js file-system APIs.**

## Prerequisites

- Node.js v20+ (`node -v`)
- npm v11+ (`npm -v`)

## Install

```bash
npm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

Compile the Next.js application:

```bash
npm run build
```

## Tests

Run the test suite:

```bash
npm run test:ci
```

Tests validate:
- The pricing discount stub (`calculateDiscount` returns 0)
- The catalogue has exactly three products with correct prices
- Checkout validation rejects invalid quantities, unknown products, empty carts, and invalid userIds
- Checkout calculation uses server-side prices (not client-supplied)
- The total is correctly computed as `subtotal - calculateDiscount(subtotal)`
- Order objects contain correct structure (id, userId, items, subtotal, discount, total, status, createdAt)
- Order items include product name and unit price
- Orders are persisted to `data/orders.json`

## API Endpoints

### GET /api/products

Returns an array of three hard-coded products (server-side catalogue).

**Response:**

```json
[
  { "id": "prod-001", "name": "Enamel Mug", "price": 12.5 },
  { "id": "prod-002", "name": "Canvas Tote", "price": 18.0 },
  { "id": "prod-003", "name": "Wool Beanie", "price": 22.75 }
]
```
, creates an order, and persists it to `data/orders.json`.

**Request:**

```json
{
  "userId": "guest",
  "items": [
    { "productId": "prod-001", "quantity": 1 },
    { "productId": "prod-002", "quantity": 2 }
  ]
}
```

**Validation:**

- `userId` must be a non-empty string.
- `items` must be a non-empty array.
- Each item must have `productId` (string) and `quantity` (positive integer).
- All `productId`s must exist in the catalogue.
- Rejects: malformed JSON, invalid types, zero/negative/fractional quantities, unknown products, empty carts, empty userId.

**Success Response (HTTP 200) — Order Object:**

```json
{
  "id": "ord-1",
  "userId": "guest",
  "items": [
    {
      "productId": "prod-001",
      "name": "Enamel Mug",
      "quantity": 1,
      "unitPrice": 12.5
    },
    {
      "productId": "prod-002",
      "name": "Canvas Tote",
      "quantity": 2,
      "unitPrice": 18.0
    }
  ],
  "subtotal": 48.5,
  "discount": 0,
  "total": 48.5,
  "status": "confirmed",
  "createdAt": "2026-09-28T12:34:56.789Z"
}
```

**Error Response (HTTP 400):**

```json
{
  "error": "quantity must be a positive integer"
}
```

### GET /api/orders

Returns the array of all orders persisted in `data/orders.json`.

**Response (HTTP 200):**

```json
[
  {
    "id": "ord-1",
    "userId": "guest",
    "items": [
      {
        "productId": "prod-001",
        "name": "Enamel Mug",
        "quantity": 1,
        "unitPrice": 12.5
      }
    ],
    "subtotal": 12.5,
    "discount": 0,
    "total": 12.5,
    "status": "confirmed",
    "createdAt": "2026-09-28T12:34:56.789Z"
  }
]
```

If no orders have been created, returns `[]`.
  "error": "quantity must be a positive integer"
}
```

## Pages

- **Home (`/`)**: Welcome page with link to checkout.
- **Checkout (`/checkout`)**: Interactive checkout interface.
  - Loads products from `GET /api/products`.
  - Allows quantity selection.
  - Submits order to `POST /api/checkout`.
  - Displays total or error message.

## Request Lifecycle

1. **Products Request:**
   - Browser requests `GET /api/products`.
   - Server returns hard-coded three-product catalogue.

2. **Checkout:**
   - User selects quantities on the checkout page.
   - User submits the form.
   - Browser sends `POST /api/checkout` with `userId: "guest"` and selected items.
   - Server validates request (non-empty userId, non-empty items, positive quantities, known products).
   - Server loads products from the catalogue.
   - Server calculates `subtotal` as `Σ(unitPrice × quantity)`.
   - Server calls `calculateDiscount(subtotal)` (baseline returns 0).
   - Server calculates `total = subtotal - discount`.
   - Server returns `{ "total": number }` (HTTP 200) or `{ "error": "..." }` (HTTP 400).

## Technology

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Plain CSS (one global stylesheet, system fonts, one accent color)
- **Testing:** Node.js built-in test runner
- **Package Manager:** npm

## Project Structure

```
checkout-service/
├── REQUIREMENTS.md        # Authoritative specification
├── PLAN.md               # Implementation plan
├── AGENTS.md             # Standing expectations
├── README.md             # This file
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
├── .gitignore            # Ignored files
├── data/
│   └── orders.json       # Persisted orders (file-system only)
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout
    │   ├── globals.css          # Global stylesheet
    │   ├── page.tsx             # Home page
    │   ├── checkout/page.tsx    # Checkout page
    │   └── api/
    │       ├── products/route.ts    # GET /api/products
    │       ├── checkout/route.ts    # POST /api/checkout
    │       └── orders/route.ts      # GET /api/orders
    └── lib/
        ├── pricing.ts           # Discount calculation (stub)
        ├── products.ts          # Product catalogue
        ├── checkout.ts          # Validation and order building
        ├── orders.ts            # Order persistence (file-system)
        └── pricing.test.ts      # Tests
```

## Money Representation

All prices and totals are floating-point dollar values (e.g., `12.5`, `18.0`, `22.75`).
No cents, no minor units, no decimal libraries.

## Constraints

**Do not add:**

- Authentication or user accounts
- Database systems (PostgreSQL, MongoDB, Firebase, Supabase, Redis, etc.)
- Docker or cloud deployment
- External services or APIs
- Payment processing
- Tailwind CSS, Material UI, Bootstrap, or component libraries
- CSS-in-JS libraries
- Additional production dependencies

**Allowed:**

- Order persistence via `data/orders.json` using Node.js `fs` APIs
- Basic file operations for storing order data

**Important:**

- The pricing module (`src/lib/pricing.ts`) is protected. Any changes require explicit human approval.
- All prices come from the server-side catalogue; client-supplied prices are ignored.
- Orders are persisted locally in `data/orders.json` using file-system APIs (not a database).

## Example Workflow

1. Install: `npm install`
2. Start: `npm run dev`
3. Open http://localhost:3000
4. Click "Go to Checkout"
5. Select quantities for products
6. Click "Submit Order"
7. View the calculated total

## Testing Checklist

Before declaring work complete:

- [ ] `npm run build` passes
- [ ] `npm run test:ci` passes
- [ ] Home page loads and displays
- [ ] Checkout page loads and shows three products
- [ ] GET `/api/products` returns exactly three products
- [ ] POST `/api/checkout` accepts valid carts and returns order object
- [ ] Order object contains: id, userId, items, subtotal, discount, total, status, createdAt
- [ ] Order items contain: productId, name, quantity, unitPrice
- [ ] GET `/api/orders` returns array of persisted orders
- [ ] Orders are stored in `data/orders.json` (checked with file-system)
- [ ] Multiple checkouts create multiple orders with incrementing IDs
- [ ] Invalid quantities (0, negative, fractional) are rejected (HTTP 400)
- [ ] Unknown product IDs are rejected (HTTP 400)
- [ ] Empty cart is rejected (HTTP 400)
- [ ] Empty userId is rejected (HTTP 400)
- [ ] Malformed JSON is rejected (HTTP 400)
- [ ] Totals use server-side prices, not client input
- [ ] No secrets, API keys, or real personal data
- [ ] No Tailwind, Material UI, Bootstrap, CSS-in-JS, authentication, or database (PostgreSQL/MongoDB/Firebase)
- [ ] `src/lib/pricing.ts` contains only the approved stub

## Questions?

Refer to `REQUIREMENTS.md` for the authoritative specification, or `PLAN.md` for implementation details.
