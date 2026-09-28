import { NextRequest, NextResponse } from "next/server";
import { validateCheckout, buildOrder } from "@/lib/checkout";
import { getOrders, createOrder, generateOrderId } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateCheckout(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get existing orders to generate next ID
    const existingOrders = await getOrders();
    const orderId = generateOrderId(existingOrders);

    // Build order object
    const order = buildOrder(orderId, validation.data);

    // Persist order
    await createOrder(order);

    // Return order object
    return NextResponse.json(order);
  } catch (error) {
    // Malformed JSON or file system error
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
}
