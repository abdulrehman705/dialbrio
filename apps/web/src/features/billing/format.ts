import { differenceInCalendarDays, format } from "date-fns";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Cents → "$1,321.08". */
export const money = (cents: number) => usd.format(cents / 100);
/** Cents → "$1,321" (plan prices, summaries). */
export const moneyWhole = (cents: number) => usdWhole.format(cents / 100);

export function periodInfo(startIso: string, endIso: string, now = new Date()) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const total = Math.max(1, differenceInCalendarDays(end, start));
  const elapsed = Math.min(total, Math.max(0, differenceInCalendarDays(now, start)));
  return {
    label: `${format(start, "MMM d")} – ${format(end, "MMM d")}`,
    closes: format(end, "MMM d"),
    daysLeft: total - elapsed,
    pct: (elapsed / total) * 100,
  };
}
