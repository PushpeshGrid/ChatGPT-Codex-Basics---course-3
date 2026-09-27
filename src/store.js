export const TAX_RATE = 0.08;

export function createCatalog() {
  return [
    { id: "sku-mug", name: "Ceramic Mug", price_cents: 1299, stock: 10 },
    { id: "sku-tee", name: "Cotton T-Shirt", price_cents: 2499, stock: 5 },
    { id: "sku-sticker", name: "Logo Sticker", price_cents: 199, stock: 50 },
  ];
}

export function createStore() {
  return {
    products: createCatalog(),
    cart: new Map(),
    orders: new Map(),
    nextOrderNumber: 1,
  };
}

export function findProduct(store, productId) {
  return store.products.find((p) => p.id === productId);
}

export function cartView(store) {
  const items = [];
  let subtotal_cents = 0;
  for (const [product_id, quantity] of store.cart.entries()) {
    const product = findProduct(store, product_id);
    const unit_price_cents = product.price_cents;
    const line_total_cents = unit_price_cents * quantity;
    subtotal_cents += line_total_cents;
    items.push({
      product_id,
      name: product.name,
      quantity,
      unit_price_cents,
      line_total_cents,
    });
  }
  return { items, subtotal_cents };
}

export function taxCents(subtotal_cents) {
  return Math.round(subtotal_cents * TAX_RATE);
}

export function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.trim().length > 2;
}

export function putCartItem(store, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: "quantity must be an integer >= 1", status: 400 };
  }
  const product = findProduct(store, productId);
  if (!product) {
    return { error: "unknown product_id", status: 400 };
  }
  if (quantity > product.stock) {
    return { error: "quantity exceeds stock", status: 400 };
  }
  store.cart.set(productId, quantity);
  return { cart: cartView(store), status: 200 };
}

export function deleteCartItem(store, productId) {
  if (!store.cart.has(productId)) {
    return { error: "item not in cart", status: 404 };
  }
  store.cart.delete(productId);
  return { cart: cartView(store), status: 200 };
}

export function checkout(store, customer_email) {
  if (!isValidEmail(customer_email)) {
    return { error: "customer_email must contain @", status: 400 };
  }
  const cart = cartView(store);
  if (cart.items.length === 0) {
    return { error: "cart is empty", status: 400 };
  }
  for (const item of cart.items) {
    const product = findProduct(store, item.product_id);
    if (item.quantity > product.stock) {
      return { error: `insufficient stock for ${item.product_id}`, status: 409 };
    }
  }
  for (const item of cart.items) {
    const product = findProduct(store, item.product_id);
    product.stock -= item.quantity;
  }
  const tax_cents = taxCents(cart.subtotal_cents);
  const order_id = `ord-${store.nextOrderNumber++}`;
  const order = {
    order_id,
    customer_email: customer_email.trim(),
    items: cart.items,
    subtotal_cents: cart.subtotal_cents,
    tax_cents,
    total_cents: cart.subtotal_cents + tax_cents,
    status: "confirmed",
  };
  store.orders.set(order_id, order);
  store.cart.clear();
  return { order, status: 201 };
}

export function getOrder(store, orderId) {
  const order = store.orders.get(orderId);
  if (!order) {
    return { error: "order not found", status: 404 };
  }
  return { order, status: 200 };
}
