import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/orders";

export async function GET(_request: NextRequest) {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}
