import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET(_request: NextRequest) {
  const products = getProducts();
  return NextResponse.json(products);
}
