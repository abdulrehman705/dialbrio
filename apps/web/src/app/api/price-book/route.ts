import { NextResponse } from "next/server";
import { getPriceBook } from "@/sanity/price-book";

/**
 * Public price book for client components (the in-app Billing screen). Server components call
 * getPriceBook() directly. Prices are public marketing content, so no auth is required.
 */
export async function GET() {
  const priceBook = await getPriceBook();
  return NextResponse.json(priceBook, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
