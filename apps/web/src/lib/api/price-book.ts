import { DEFAULT_PRICE_BOOK, type PriceBook } from "@dialbrio/types";

/**
 * The price book is CMS content served by this Next.js app (app/api/price-book), not by the /v1 API,
 * so the mock and HTTP repositories share this implementation. Falls back to the code price book.
 */
export async function fetchPriceBook(): Promise<PriceBook> {
  try {
    const res = await fetch("/api/price-book", { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`price book ${res.status}`);
    return (await res.json()) as PriceBook;
  } catch {
    return DEFAULT_PRICE_BOOK;
  }
}
