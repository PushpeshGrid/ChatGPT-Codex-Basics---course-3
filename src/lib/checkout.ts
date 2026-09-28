import { calculateDiscount } from "./pricing.ts";
import { getProductById } from "./products.ts";

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  userId: string;
  items: CheckoutItem[];
}

export interface CheckoutResult {
  total: number;
}

export interface ValidationError {
  error: string;
}

export function validateCheckout(
  body: unknown
): { valid: true; data: CheckoutRequest } | { valid: false; error: string } {
  // Check if body is an object
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const obj = body as Record<string, unknown>;

  // Validate userId
  if (typeof obj.userId !== "string" || obj.userId.trim() === "") {
    return { valid: false, error: "userId must be a non-empty string" };
  }

  // Validate items array
  if (!Array.isArray(obj.items)) {
    return { valid: false, error: "items must be an array" };
  }

  if (obj.items.length === 0) {
    return { valid: false, error: "items array must not be empty" };
  }

  // Validate each item
  for (const item of obj.items) {
    if (typeof item !== "object" || item === null) {
      return { valid: false, error: "Each item must be an object" };
    }

    const itemObj = item as Record<string, unknown>;

    // Check productId
    if (typeof itemObj.productId !== "string") {
      return { valid: false, error: "productId must be a string" };
    }

    // Check quantity is a positive integer
    if (
      typeof itemObj.quantity !== "number" ||
      !Number.isInteger(itemObj.quantity) ||
      itemObj.quantity <= 0
    ) {
      return {
        valid: false,
        error: "quantity must be a positive integer",
      };
    }

    // Check product exists
    if (!getProductById(itemObj.productId)) {
      return {
        valid: false,
        error: `Unknown productId: ${itemObj.productId}`,
      };
    }
  }

  return {
    valid: true,
    data: {
      userId: obj.userId,
      items: obj.items as CheckoutItem[],
    },
  };
}

export function calculateCheckout(request: CheckoutRequest): CheckoutResult {
  let subtotal = 0;

  for (const item of request.items) {
    const product = getProductById(item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
    }
  }

  const discount = calculateDiscount(subtotal);
  const total = subtotal - discount;

  return { total };
}
