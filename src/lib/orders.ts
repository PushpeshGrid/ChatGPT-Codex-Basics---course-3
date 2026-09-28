import { promises as fs } from "fs";
import path from "path";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory may already exist, ignore error
  }
}

async function readOrders(): Promise<Order[]> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export async function getOrders(): Promise<Order[]> {
  return readOrders();
}

export async function createOrder(order: Order): Promise<Order> {
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
  return order;
}

export function generateOrderId(orders: Order[]): string {
  const maxId = orders.reduce((max, order) => {
    const match = order.id.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `ord-${maxId + 1}`;
}
