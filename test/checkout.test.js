import assert from "node:assert/strict";
import http from "node:http";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";
import { createStore, taxCents } from "../src/store.js";

function listen(app) {
  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${port}`,
      });
    });
  });
}

async function request(base, method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, json };
}

let ctx;

before(async () => {
  const store = createStore();
  ctx = await listen(createApp(store));
  ctx.store = store;
});

after(() => {
  return new Promise((resolve, reject) => {
    ctx.server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("GET /health", async () => {
  const res = await request(ctx.url, "GET", "/health");
  assert.equal(res.status, 200);
  assert.deepEqual(res.json, { status: "ok" });
});

test("GET /products returns seeded catalog", async () => {
  const res = await request(ctx.url, "GET", "/products");
  assert.equal(res.status, 200);
  assert.equal(res.json.products.length, 3);
  assert.equal(res.json.products[0].id, "sku-mug");
});

test("cart validation rejects unknown product", async () => {
  const res = await request(ctx.url, "PUT", "/cart/items", {
    product_id: "nope",
    quantity: 1,
  });
  assert.equal(res.status, 400);
});

test("tax is 8% rounded to nearest cent", () => {
  assert.equal(taxCents(2598), 208);
});

test("successful checkout decrements stock and clears cart", async () => {
  const add = await request(ctx.url, "PUT", "/cart/items", {
    product_id: "sku-mug",
    quantity: 2,
  });
  assert.equal(add.status, 200);
  assert.equal(add.json.subtotal_cents, 2598);

  const placed = await request(ctx.url, "POST", "/checkout", {
    customer_email: "buyer@example.com",
  });
  assert.equal(placed.status, 201);
  assert.equal(placed.json.order_id, "ord-1");
  assert.equal(placed.json.tax_cents, 208);
  assert.equal(placed.json.total_cents, 2806);
  assert.equal(placed.json.status, "confirmed");

  const mug = ctx.store.products.find((p) => p.id === "sku-mug");
  assert.equal(mug.stock, 8);

  const cart = await request(ctx.url, "GET", "/cart");
  assert.deepEqual(cart.json, { items: [], subtotal_cents: 0 });

  const order = await request(ctx.url, "GET", `/orders/${placed.json.order_id}`);
  assert.equal(order.status, 200);
  assert.equal(order.json.customer_email, "buyer@example.com");
});

test("checkout with empty cart is 400", async () => {
  const res = await request(ctx.url, "POST", "/checkout", {
    customer_email: "buyer@example.com",
  });
  assert.equal(res.status, 400);
});

test("checkout exceeds stock is 409", async () => {
  const add = await request(ctx.url, "PUT", "/cart/items", {
    product_id: "sku-tee",
    quantity: 5,
  });
  assert.equal(add.status, 200);
  ctx.store.products.find((p) => p.id === "sku-tee").stock = 1;
  const placed = await request(ctx.url, "POST", "/checkout", {
    customer_email: "buyer@example.com",
  });
  assert.equal(placed.status, 409);
});

test("missing order is 404", async () => {
  const res = await request(ctx.url, "GET", "/orders/ord-missing");
  assert.equal(res.status, 404);
});
