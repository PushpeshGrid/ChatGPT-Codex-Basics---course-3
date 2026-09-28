import { NextRequest, NextResponse } from "next/server";
import { validateCheckout, calculateCheckout } from "@/lib/checkout";

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

    const result = calculateCheckout(validation.data);
    return NextResponse.json(result);
  } catch (error) {
    // Malformed JSON
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
}
