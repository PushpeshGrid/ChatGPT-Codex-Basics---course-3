# Checkout Service

A small Next.js e-commerce checkout application for AI coding-agent training.

**No cloud services, no database, no Docker. State is stateless per request.**

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

### POST /api/checkout

Validates a checkout request and calculates the total.

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

**Success Response (HTTP 200):**

```json
{
  "total": 30.5
}
```

**Error Response (HTTP 400):**

```json
{
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
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout
    │   ├── globals.css          # Global stylesheet
    │   ├── page.tsx             # Home page
    │   ├── checkout/page.tsx    # Checkout page
    │   └── api/
    │       ├── products/route.ts    # GET /api/products
    │       └── checkout/route.ts    # POST /api/checkout
    └── lib/
        ├── pricing.ts           # Discount calculation (stub)
        ├── products.ts          # Product catalogue
        ├── checkout.ts          # Validation and totals
        └── pricing.test.ts      # Tests
```

## Money Representation

All prices and totals are floating-point dollar values (e.g., `12.5`, `18.0`, `22.75`).
No cents, no minor units, no decimal libraries.

## Constraints

**Do not add:**

- Authentication or user accounts
- Database or persistent storage
- Docker or cloud deployment
- External services or APIs
- Payment processing
- Tailwind CSS, Material UI, Bootstrap, or component libraries
- CSS-in-JS libraries
- Additional production dependencies

**Important:**

- The pricing module (`src/lib/pricing.ts`) is protected. Any changes require explicit human approval.
- All prices come from the server-side catalogue; client-supplied prices are ignored.
- The checkout is stateless; no session or cart persistence.

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
- [ ] POST `/api/checkout` accepts valid carts and returns `{ total }`
- [ ] Invalid quantities (0, negative, fractional) are rejected (HTTP 400)
- [ ] Unknown product IDs are rejected (HTTP 400)
- [ ] Empty cart is rejected (HTTP 400)
- [ ] Empty userId is rejected (HTTP 400)
- [ ] Malformed JSON is rejected (HTTP 400)
- [ ] Totals use server-side prices, not client input
- [ ] No secrets, API keys, or real personal data
- [ ] No Tailwind, Material UI, Bootstrap, CSS-in-JS, authentication, or database
- [ ] `src/lib/pricing.ts` contains only the approved stub

## Questions?

Refer to `REQUIREMENTS.md` for the authoritative specification, or `PLAN.md` for implementation details.
