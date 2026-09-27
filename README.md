# checkout-service

Local Node.js checkout API for AI coding-agent training.

No Google Cloud, no database, no Docker. State lives in memory.

## Prerequisites checked

```text
node -v   # v25.8.2
npm -v    # 11.11.1
```

## Run

```bash
npm test
npm start
```

Server: `http://localhost:3000`

## Try it

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/products
curl -s -X PUT http://localhost:3000/cart/items \
  -H 'content-type: application/json' \
  -d '{"product_id":"sku-mug","quantity":2}'
curl -s -X POST http://localhost:3000/checkout \
  -H 'content-type: application/json' \
  -d '{"customer_email":"buyer@example.com"}'
```

See `REQUIREMENTS.md` for the full spec and `PLAN.md` for the step list.
