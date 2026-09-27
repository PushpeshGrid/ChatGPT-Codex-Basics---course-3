import http from "node:http";
import { createApp } from "./app.js";
import { createStore } from "./store.js";

const port = Number(process.env.PORT) || 3000;
const server = http.createServer(createApp(createStore()));

server.listen(port, () => {
  console.log(`checkout-service listening on http://localhost:${port}`);
});
