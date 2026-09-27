import {
  cartView,
  checkout,
  createStore,
  deleteCartItem,
  getOrder,
  putCartItem,
} from "./store.js";

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function html(res, status, body) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
}

function notFound(res) {
  json(res, 404, { error: "not found" });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

export function createApp(store = createStore()) {
  return async function handler(req, res) {
    const url = new URL(req.url, "http://localhost");
    const { pathname } = url;
    const method = req.method;

    try {
      if (method === "GET" && (pathname === "/" || pathname === "/index.html")) {
        return html(
          res,
          200,
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Checkout Service</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 60rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    a { color: #1a5fb4; }
    code { background: #f3f3f3; padding: 0.1rem 0.3rem; border-radius: 4px; }
    .product { display: flex; gap: 1rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    .product img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; }
    .controls { display: flex; gap: 0.5rem; align-items: center; }
    input[type=number] { width: 4.5rem; }
    button { background: #1a5fb4; color: white; border: none; padding: 0.4rem 0.6rem; border-radius: 6px; cursor: pointer; }
    button.secondary { background: #666; }
  </style>
</head>
<body>
  <h1>Checkout Service — Demo UI</h1>
  <p>This simple storefront is for demonstration and screenshots. It talks to the API endpoints in this project.</p>

  <section>
    <h2>Products</h2>
    <div id="products">Loading…</div>
  </section>

  <section>
    <h2>Cart</h2>
    <div id="cart">Loading…</div>
    <div style="margin-top:0.5rem;"><button id="checkout">Checkout</button></div>
  </section>

  <script>
    async function fetchJson(path, opts) {
      const res = await fetch(path, opts);
      return res.json();
    }

    function el(tag, props = {}, ...children) {
      const e = document.createElement(tag);
      Object.entries(props).forEach(([k,v]) => { if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); });
      children.flat().forEach(c => e.append(typeof c === 'string' ? document.createTextNode(c) : c));
      return e;
    }

    async function loadProducts() {
      const data = await fetchJson('/products');
      const container = document.getElementById('products');
      container.innerHTML = '';
      if (!data || !data.products) { container.textContent = 'No products'; return; }
      data.products.forEach(p => {
        const row = el('div', { class: 'product' },
          el('img', { src: p.image || 'https://via.placeholder.com/64', alt: p.name }),
          el('div', {}, el('strong', {}, p.name), el('div', {}, '$' + (p.price / 100).toFixed(2))),
          el('div', { class: 'controls' },
            el('input', { type: 'number', min: 0, value: 1, id: 'qty-' + p.id }),
            el('button', { onclick: async () => { const q = Number(document.getElementById('qty-' + p.id).value); await fetchJson('/cart/items', { method: 'PUT', body: JSON.stringify({ product_id: p.id, quantity: q }), headers: { 'Content-Type': 'application/json' } }); await loadCart(); } }, 'Add')
          )
        );
        container.append(row);
      });
    }

    async function loadCart() {
      const data = await fetchJson('/cart');
      const container = document.getElementById('cart');
      container.innerHTML = '';
      if (!data || !data.items || data.items.length === 0) {
        container.textContent = 'Cart is empty';
        return;
      }
      data.items.forEach(item => {
        const row = el('div', { class: 'product' },
          el('div', {}, el('strong', {}, item.product.name), el('div', {}, '$' + (item.product.price / 100).toFixed(2))),
          el('div', {}, 'Qty: ' + item.quantity),
          el('div', { class: 'controls' }, el('button', { class: 'secondary', onclick: async () => { await fetch('/cart/items/' + encodeURIComponent(item.product.id), { method: 'DELETE' }); await loadCart(); } }, 'Remove'))
        );
        container.append(row);
      });
    }

    document.getElementById('checkout').addEventListener('click', async () => {
      const email = prompt('Enter email for order confirmation');
      if (!email) return;
      const res = await fetchJson('/checkout', { method: 'POST', body: JSON.stringify({ customer_email: email }), headers: { 'Content-Type': 'application/json' } });
      alert('Order created: ' + (res.id || JSON.stringify(res)));
      await loadCart();
    });

    loadProducts();
    loadCart();
  </script>
</body>
</html>`,
        );
      }

      if (method === "GET" && pathname === "/favicon.ico") {
        res.writeHead(204);
        return res.end();
      }

      if (method === "GET" && pathname === "/health") {
        return json(res, 200, { status: "ok" });
      }

      if (method === "GET" && pathname === "/products") {
        return json(res, 200, { products: store.products });
      }

      if (method === "GET" && pathname === "/cart") {
        return json(res, 200, cartView(store));
      }

      if (method === "PUT" && pathname === "/cart/items") {
        const body = await readJson(req);
        const result = putCartItem(store, body.product_id, body.quantity);
        if (result.error) {
          return json(res, result.status, { error: result.error });
        }
        return json(res, result.status, result.cart);
      }

      const cartItemMatch = pathname.match(/^\/cart\/items\/([^/]+)$/);
      if (method === "DELETE" && cartItemMatch) {
        const result = deleteCartItem(store, decodeURIComponent(cartItemMatch[1]));
        if (result.error) {
          return json(res, result.status, { error: result.error });
        }
        return json(res, result.status, result.cart);
      }

      if (method === "POST" && pathname === "/checkout") {
        const body = await readJson(req);
        const result = checkout(store, body.customer_email);
        if (result.error) {
          return json(res, result.status, { error: result.error });
        }
        return json(res, result.status, result.order);
      }

      const orderMatch = pathname.match(/^\/orders\/([^/]+)$/);
      if (method === "GET" && orderMatch) {
        const result = getOrder(store, decodeURIComponent(orderMatch[1]));
        if (result.error) {
          return json(res, result.status, { error: result.error });
        }
        return json(res, result.status, result.order);
      }

      return notFound(res);
    } catch (err) {
      if (err instanceof SyntaxError) {
        return json(res, 400, { error: "invalid JSON body" });
      }
      return json(res, 500, { error: "internal error" });
    }
  };
}
