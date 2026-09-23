import type { CallingWindow, DialQueue } from "@dialbrio/types";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0].map((d) => ({ value: d, short: DAY_SHORT[d]!, letter: DAY_SHORT[d]![0]! }));

/** "Mon–Sat · 09:00–20:00 contact time" */
export function formatWindow(w: CallingWindow) {
  const days = [...w.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const contiguous = days.every((d, i) => i === 0 || (d - days[i - 1]! + 7) % 7 === 1);
  const dayLabel =
    days.length === 7 ? "Every day" : contiguous && days.length > 2 ? `${DAY_SHORT[days[0]!]}–${DAY_SHORT[days[days.length - 1]!]}` : days.map((d) => DAY_SHORT[d]).join(", ");
  return `${dayLabel} · ${w.start}–${w.end} ${w.timezone === "contact" ? "local" : w.timezone}`;
}

/**
 * Wait-time target for a queue, derived from its most urgent lifecycle state.
 * Display-only until SLA becomes a configurable queue field.
 */
export function slaMinutes(q: Pick<DialQueue, "leadStates" | "sources">) {
  if (q.sources.includes("DialBrio callbacks")) return 15;
  if (q.leadStates.includes("fresh")) return 5;
  if (q.leadStates.includes("warm")) return 60;
  if (q.leadStates.includes("aged")) return 240;
  return 1440;
}

export function formatMinutes(m: number) {
  if (m < 1) return "< 1m";
  if (m < 60) return `${Math.round(m)}m`;
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return r ? `${h}h ${r}m` : `${h}h`;
}
