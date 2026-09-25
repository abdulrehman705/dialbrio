import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNowStrict, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const nf = new Intl.NumberFormat("en-US");
export const formatNumber = (n: number) => nf.format(n);

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** 0.342 → "34.2%" */
export function formatPercent(ratio: number, digits = 1) {
  return `${(ratio * 100).toFixed(digits)}%`;
}

/** Seconds → "4:05" or "1:02:09" (timers, call durations). */
export function formatClock(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

/** Seconds → "2h 14m" / "4m 12s" / "38s" (aggregates). */
export function formatDuration(totalSec: number) {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

/** E.164 (+15551234567) → "(555) 123-4567" for NANP; other numbers returned as-is. */
export function formatPhone(e164: string) {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export function timeAgo(iso: string) {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

/** Compact timestamp for lists: "2:41 PM", "Yesterday", "Sep 18". */
export function formatListTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "MMM d, h:mm a");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
