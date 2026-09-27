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
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    a { color: #1a5fb4; }
    code { background: #f3f3f3; padding: 0.1rem 0.3rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Checkout Service</h1>
  <p>This is a JSON API. There is no storefront UI yet. Open these endpoints:</p>
  <ul>
    <li><a href="/health">/health</a></li>
    <li><a href="/products">/products</a></li>
    <li><a href="/cart">/cart</a></li>
  </ul>
  <p>Checkout is <code>POST /checkout</code> (use curl or an API client, not this page).</p>
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
