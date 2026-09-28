# Checkout Service — Baseline Requirements

Authoritative specification for this disposable training repository.

Later explicit course requirements supersede earlier ones. Do not invent features.

## Goal

Build a small Next.js full-stack e-commerce checkout application.

The baseline must include:

- A home page
- A checkout page
- `GET /api/products`
- `POST /api/checkout`
- `src/lib/pricing.ts`
- `README.md`
- One placeholder unit test
- Strict TypeScript
- Next.js App Router
- `src/` directory
- npm scripts named exactly: `dev`, `build`, `test:ci`

Keep the implementation intentionally small.

## Working directory

Work inside the current repository.

- Inspect structure before changing files.
- Do not delete existing files automatically.
- Do not overwrite unrelated files.
- Treat this file as the source of truth once it exists.

## Technology

**Use:** Next.js, App Router, TypeScript (strict), `src/` directory, npm.

**Styling:** Plain inline styles **or** one global CSS file. System font. One accent color. Rounded cards or buttons. Centered max-width container. Consistent spacing. Simple and clean.

**Do not add:** Tailwind CSS, Material UI, Bootstrap, any component library, CSS-in-JS, authentication, database (PostgreSQL, MongoDB, Firebase, etc.), Docker, external services, payment provider, cloud services, unrelated frameworks, unnecessary production dependencies. File-system persistence via `data/orders.json` is explicitly permitted for this task.

## Money representation

Represent money as floating-point dollar values (examples: `4.99`, `12.50`, `18.00`).

Do **not** use cents/minor units, Decimal.js, BigInt, or another money library unless a later explicit requirement says so.

## Products API

`GET /api/products`

Return **exactly three** hard-coded **server-side** products:

```json
[
  { "id": "prod-001", "name": "Enamel Mug", "price": 12.5 },
  { "id": "prod-002", "name": "Canvas Tote", "price": 18.0 },
  { "id": "prod-003", "name": "Wool Beanie", "price": 22.75 }
]
```

- Catalogue is server-side only.
- Do not accept prices from the client.
- No database. No external API.

## Checkout API

### POST /api/checkout

Expected request body:

```json
{
  "userId": "guest",
  "items": [{ "productId": "...", "quantity": 0 }]
}
```

(`quantity: 0` in the example is illustrative of the field, not a valid value.)

#### Validation

1. `userId` must be a non-empty string.
2. `items` must be a non-empty array.
3. Every item must contain `productId` and `quantity`.
4. `quantity` must be a positive integer (greater than zero, not negative, not zero, not fractional, not missing).
5. Every `productId` must identify a product from `GET /api/products`.
6. Reject malformed JSON, missing fields, incorrect types, invalid quantities, unknown product IDs, empty carts, empty `userId`, and other invalid requests.
7. Every invalid request returns HTTP **400** with `{ "error": "human-readable message" }`.
8. Never trust a client-supplied product price.
9. Server calculates totals from the server-side catalogue.
10. `subtotal` = sum of `unitPrice * quantity` for every item.
11. `total` = `subtotal - calculateDiscount(subtotal)`.
12. Baseline `calculateDiscount` returns `0`, so `total` equals `subtotal`.

#### Persistence

13. On successful validation, create an order object and persist it to `data/orders.json` using Node.js file-system APIs.
14. Do not use a database (PostgreSQL, MongoDB, Firebase, etc.). Use only `data/orders.json`.
15. Successful checkout returns HTTP **200** with the order object containing:
    - `id`: unique order identifier (string, e.g., `"ord-1"`)
    - `userId`: from the request
    - `items`: array of order items (see item shape below)
    - `subtotal`: calculated subtotal (floating-point dollars)
    - `discount`: calculated discount (floating-point dollars)
    - `total`: calculated total (floating-point dollars)
    - `status`: order status (e.g., `"confirmed"`)
    - `createdAt`: ISO 8601 timestamp string

#### Order Item Shape

Each item in the `items` array must contain:
- `productId`: product ID from the catalogue
- `name`: product name (from server-side catalogue)
- `quantity`: quantity ordered (positive integer)
- `unitPrice`: unit price at time of order (floating-point dollars, from server-side catalogue)

### GET /api/orders

Returns the current array of all orders persisted in `data/orders.json`.

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

If `data/orders.json` does not exist or is empty, return `[]`.

## Sensitive pricing module

`src/lib/pricing.ts` must contain **only** this no-op stub:
data/
│   └── orders.json          # Persisted orders (file-system only, no database)
├── src/app/page.tsx
├── src/app/checkout/page.tsx
├── src/app/api/products/route.ts
├── src/app/api/checkout/route.ts
├── src/app/api/orders
}
```

Creating this exact initial stub is allowed as part of the approved plan.

After that, **do not modify** `src/lib/pricing.ts` without explicit human approval (no discount logic, signature changes, refactors, or helpers).

If a task appears to require editing it: stop, explain the proposed change, ask for approval, wait.

## Request flow

Checkout:

Browser → Checkout page → `POST /api/checkout` → validate → load server-side catalogue → find products by `productId` → calculate subtotal → `calculateDiscount(subtotal)` → calculate total → JSON response.

Products:

Browser → `GET /api/products` → server-side hard-coded catalogue → product JSON.

Document this in `README.md`.

## Home page

- Clear heading, short description, link/button to checkout, clean styling.
- Do not add login, signup, accounts, dashboard, search, product management, admin, payment, cart persistence, or database.

## Checkout page

- Show the small catalogue or allow product selection.
- Allow quantities.
- Hard-coded/default `userId` such as `"guest"` if no user input is needed.
- Submit cart to `POST /api/checkout`.
- Display result and understandable validation/error messages.
- Authoritative price comes from the API, not client-side calculation.
- Do not implement authentication, payment processing, database storage, account management, order history, or external services.

## Project structure (approximate)

```text
checkout-service/
├── REQUIREMENTS.md
├── PLAN.md
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── next.config.*
├── src/app/page.tsx
├── src/app/checkout/page.tsx
├── src/app/api/products/route.ts
├── src/app/api/checkout/route.ts
└── src/lib/pricing.ts
```

Test file location may differ if the testing setup requires it. Document the final structure in the plan before implementation.

## Package scripts

Exact names: `dev`, `build`, `test:ci`.

Runnable with `npm install && npm run dev`.

## Testing

- At least one placeholder unit test, wired to `npm run test:ci`.
- Keep the suite small.
- Cover: build succeeds; test command works; product endpoint returns three products; checkout accepts valid carts; rejects invalid quantities, unknown products, empty carts, invalid userId; totals use server-side prices; discount function is wired in; invalid/malformed input returns HTTP 400 with an error object.

## README.md

Must explain: what the project is; install; `dev`; `build`; tests; API endpoints; request/response behavior; request lifecycle; repository constraints; assumptions. Must match actual behavior. Never document behavior that does not exist.

## AGENTS.md

Standing expectations equivalent to:

- Use strict TypeScript.
- Run `npm run build` before declaring work complete.
- Run `npm run test:ci` before declaring work complete.
- Do not add a production dependency without human approval.
- Do not edit `src/lib/pricing.ts` without human review.
- Money is floating-point dollars.
- Never place secrets or real customer data in the repository.

## Dependencies

Minimum required. No production dependency without human approval (except the course-required Next.js/React/TypeScript stack). No Tailwind, component libraries, database, auth, payment, or cloud SDKs.

## Git / file safety

No secrets, API keys, credentials, real customer data, personal information, production/cloud credentials.

## Acceptance checks

Before calling the work complete:

```bash
npm install
npm run build
npm run test:ci
npm run devcontains order object with id, userId, items, subtotal, discount, total, status, createdAt; GET /api/orders returns array of persisted orders; orders are stored in data/orders.json (not a database); no
```

Then verify: home loads; checkout link works; checkout page loads; products endpoint returns exactly three products; valid checkout succeeds; total from server-side prices; invalid quantities / unknown IDs / empty cart / invalid userId rejected; invalid input is HTTP 400; success JSON shape is `{ "total": number }`; no database, auth, external services, Docker, Tailwind, or component library; `pricing.ts` is still only the approved stub; README matches behavior.
 (PostgreSQL, MongoDB, Firebase, Supabase, Redis, etc.), payments, Stripe, Docker, Kubernetes, cloud deployment, analytics, logging platforms, admin panel, product/inventory management, email, notifications, real discount engine, advanced checkout.

Note: File-system persistence via `data/orders.json` is explicitly required for order storage and is not considered "database."
## Out of scope (do not invent)

Authentication, user accounts, database, persistent orders, payments, Stripe, Firebase, Supabase, Redis, Docker, Kubernetes, cloud deployment, analytics, logging platforms, admin panel, product/inventory management, email, notifications, real discount engine, advanced checkout.

## Workflow

Inspect → `REQUIREMENTS.md` → read-only plan in `PLAN.md` → **stop for human approval (`APPROVE PLAN`)** → implement only the approved plan → build/tests → diff review → evidence report.

Never skip the human review checkpoint.
