import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateDiscount } from "./pricing.ts";
import { getProducts, getProductById } from "./products.ts";
import {
  validateCheckout,
  calculateCheckout,
  buildOrder,
} from "./checkout.ts";

describe("pricing", () => {
  test("calculateDiscount returns 0 for any subtotal", () => {
    assert.equal(calculateDiscount(10), 0);
    assert.equal(calculateDiscount(100), 0);
    assert.equal(calculateDiscount(0), 0);
  });
});

describe("products", () => {
  test("getProducts returns exactly three products", () => {
    const products = getProducts();
    assert.equal(products.length, 3);
  });

  test("getProducts returns correct product ids", () => {
    const products = getProducts();
    const ids = products.map((p) => p.id).sort();
    assert.deepEqual(ids, ["prod-001", "prod-002", "prod-003"]);
  });

  test("getProducts returns correct prices", () => {
    const products = getProducts();
    assert.equal(products[0].price, 12.5);
    assert.equal(products[1].price, 18.0);
    assert.equal(products[2].price, 22.75);
  });

  test("getProductById finds existing product", () => {
    const product = getProductById("prod-001");
    assert.ok(product);
    assert.equal(product.name, "Enamel Mug");
    assert.equal(product.price, 12.5);
  });

  test("getProductById returns undefined for unknown product", () => {
    const product = getProductById("unknown");
    assert.equal(product, undefined);
  });
});

describe("checkout validation", () => {
  test("accepts valid checkout request", () => {
    const result = validateCheckout({
      userId: "guest",
      items: [{ productId: "prod-001", quantity: 1 }],
    });
    assert.equal(result.valid, true);
    if (result.valid) {
      assert.equal(result.data.userId, "guest");
      assert.equal(result.data.items.length, 1);
    }
  });

  test("rejects non-string userId", () => {
    const result = validateCheckout({
      userId: 123,
      items: [{ productId: "prod-001", quantity: 1 }],
    });
    assert.equal(result.valid, false);
  });

  test("rejects empty userId", () => {
    const result = validateCheckout({
      userId: "",
      items: [{ productId: "prod-001", quantity: 1 }],
    });
    assert.equal(result.valid, false);
  });

  test("rejects missing items", () => {
    const result = validateCheckout({
      userId: "guest",
    });
    assert.equal(result.valid, false);
  });

  test("rejects empty items array", () => {
    const result = validateCheckout({
      userId: "guest",
      items: [],
    });
    assert.equal(result.valid, false);
  });

  test("rejects zero quantity", () => {
    const result = validateCheckout({
      userId: "guest",
      items: [{ productId: "prod-001", quantity: 0 }],
    });
    assert.equal(result.valid, false);
  });

  test("rejects negative quantity", () => {
    const result = validateCheckout({
      userId: "guest",
      items: [{ productId: "prod-001", quantity: -1 }],
    });
    assert.equal(result.valid, false);
  });

  test("rejects fractional quantity", () => {
    const result = validateCheckout({
      userId: "guest",
      items: [{ productId: "prod-001", quantity: 1.5 }],
    });
    assert.equal(result.valid, false);
  });

  test("rejects unknown productId", () => {
    const result = validateCheckout({
      userId: "guest",
      items: [{ productId: "unknown", quantity: 1 }],
    });
    assert.equal(result.valid, false);
  });

  test("rejects malformed JSON (non-object body)", () => {
    const result = validateCheckout("not an object");
    assert.equal(result.valid, false);
  });
});

describe("checkout calculation", () => {
  test("calculates correct total with single item", () => {
    const result = calculateCheckout({
      userId: "guest",
      items: [{ productId: "prod-001", quantity: 1 }],
    });
    assert.equal(result.total, 12.5);
  });

  test("calculates correct total with multiple items", () => {
    const result = calculateCheckout({
      userId: "guest",
      items: [
        { productId: "prod-001", quantity: 1 }, // 12.5
        { productId: "prod-002", quantity: 1 }, // 18.0
      ],
    });
    assert.equal(result.total, 30.5);
  });

  test("calculates correct total with quantity > 1", () => {
    const result = calculateCheckout({
      userId: "guest",
      items: [{ productId: "prod-001", quantity: 2 }],
    });
    assert.equal(result.total, 25.0);
  });

  test("applies discount through calculateDiscount", () => {
    const result = calculateCheckout({
      userId: "guest",
      items: [{ productId: "prod-003", quantity: 1 }], // 22.75
    });
    // discount should be 0, so total = 22.75 - 0 = 22.75
    assert.equal(result.total, 22.75);
  });
});

describe("order building", () => {
  test("builds order with correct shape", () => {
    const order = buildOrder("ord-1", {
      userId: "guest",
      items: [{ productId: "prod-001", quantity: 1 }],
    });

    assert.equal(order.id, "ord-1");
    assert.equal(order.userId, "guest");
    assert.equal(order.status, "confirmed");
    assert.equal(order.subtotal, 12.5);
    assert.equal(order.discount, 0);
    assert.equal(order.total, 12.5);
    assert.ok(order.createdAt);
    assert.ok(order.createdAt.match(/^\d{4}-\d{2}-\d{2}T/)); // ISO 8601
  });

  test("builds order items with product name and unit price", () => {
    const order = buildOrder("ord-2", {
      userId: "guest",
      items: [
        { productId: "prod-001", quantity: 2 },
        { productId: "prod-002", quantity: 1 },
      ],
    });

    assert.equal(order.items.length, 2);
    assert.equal(order.items[0].productId, "prod-001");
    assert.equal(order.items[0].name, "Enamel Mug");
    assert.equal(order.items[0].quantity, 2);
    assert.equal(order.items[0].unitPrice, 12.5);
    assert.equal(order.items[1].productId, "prod-002");
    assert.equal(order.items[1].name, "Canvas Tote");
    assert.equal(order.items[1].quantity, 1);
    assert.equal(order.items[1].unitPrice, 18.0);
  });

  test("calculates order total correctly in order object", () => {
    const order = buildOrder("ord-3", {
      userId: "guest",
      items: [
        { productId: "prod-001", quantity: 1 }, // 12.5
        { productId: "prod-002", quantity: 1 }, // 18.0
      ],
    });

    assert.equal(order.subtotal, 30.5);
    assert.equal(order.discount, 0);
    assert.equal(order.total, 30.5);
  });
});
