"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import CountUp from "@/components/reactbits/CountUp";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Kpi {
  label: string;
  value: React.ReactNode;
  /** Relative change (0.12 = +12%). */
  delta?: number;
  /** A decrease is good (speed to lead, idle time, DNC). */
  invert?: boolean;
  /** Replaces the delta line, e.g. "Oldest 2h 44m". */
  note?: React.ReactNode;
  noteTone?: "muted" | "warning";
}

/**
 * One bordered row of metrics separated by hairlines — reads as a single instrument panel rather
 * than a grid of identical cards. Wraps to 2/3 columns on smaller screens.
 */
export function KpiStrip({ items, loading, deltaLabel, label, className, columns = 6 }: { items: Kpi[]; loading?: boolean; deltaLabel?: string; label: string; className?: string; columns?: 4 | 5 | 6 }) {
  const cols = { 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6" }[columns];
  return (
    <section aria-label={label} className={cn("overflow-hidden rounded-lg border border-border bg-surface shadow-xs", className)}>
      <dl className={cn("-mr-px -mb-px grid grid-cols-2 md:grid-cols-3", cols)}>
        {items.map((k) => (
          <div key={k.label} className="flex min-w-0 flex-col gap-1 border-r border-b border-border px-4 py-4 md:px-5">
            <dt className="truncate text-[13px] text-fg-muted">{k.label}</dt>
            {loading ? (
              <>
                <Skeleton className="mt-1 h-7 w-20" />
                <Skeleton className="h-3.5 w-24" />
              </>
            ) : (
              <>
                <dd className="font-display text-[28px] leading-8 font-bold tracking-[-0.03em] text-fg">
                  {typeof k.value === "string" || typeof k.value === "number" ? <CountOnce id={`${label}:${k.label}`} text={String(k.value)} /> : k.value}
                </dd>
                <dd className="min-h-4 text-xs">
                  {k.note ? (
                    <span className={k.noteTone === "warning" ? "text-warning-text" : "text-fg-muted"}>{k.note}</span>
                  ) : k.delta !== undefined ? (
                    <Delta value={k.delta} invert={k.invert} label={deltaLabel} />
                  ) : null}
                </dd>
              </>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Delta({ value, invert, label }: { value: number; invert?: boolean; label?: string }) {
  const flat = Math.abs(value) < 0.005;
  const good = invert ? value < 0 : value > 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-flex items-center gap-0.5 font-mono tabular", flat ? "text-fg-muted" : good ? "text-success-text" : "text-danger-text")}>
        {!flat && <Icon className="size-3" aria-hidden />}
        <span className="sr-only">{flat ? "No change" : value > 0 ? "Up" : "Down"}</span>
        {flat ? "0.0%" : `${Math.abs(value * 100).toFixed(1)}%`}
      </span>
      {label && <span className="text-fg-muted">{label}</span>}
    </span>
  );
}

/* ── One-time count-up (React Bits CountUp) ─────────────────────────────── */

/** Metric ids that have already counted up this page session. Refetches and range switches update instantly. */
const counted = new Set<string>();
/** Plain numbers only: "1,284", "29.7%", "$1,321.08", "135/hr". Durations like "1m 34s" stay static. */
const NUMERIC = /^(\$?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(%|\/hr)?$/;

/**
 * Counts a metric up once, the first time it appears in this session. The final text reserves the
 * width (no layout shift) and is what screen readers get; reduced motion renders it directly.
 */
export function CountOnce({ id, text, duration = 0.6 }: { id: string; text: string; duration?: number }) {
  const reduce = useReducedMotion();
  const [animate] = React.useState(() => !counted.has(id));
  const [first] = React.useState(text);
  const [settled, setSettled] = React.useState(false);
  const liveRef = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => void counted.add(id), [id]);

  // CountUp's spring creeps through its last fraction for seconds. Once the displayed number is
  // within 1.5% of the target, swap to the exact text so a total never lingers on a wrong value.
  React.useEffect(() => {
    const el = liveRef.current;
    if (!el || settled) return;
    const num = (t: string) => Number(t.replace(/[^\d.]/g, ""));
    const target = num(text);
    const check = () => {
      const v = num(el.textContent ?? "");
      if (target === 0 || Math.abs(target - v) / target < 0.015) setSettled(true);
    };
    const mo = new MutationObserver(check);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [text, settled]);

  const m = NUMERIC.exec(text);
  if (!animate || reduce || settled || !m || text !== first) return <>{text}</>;

  const [, prefix = "", whole = "0", frac = "", suffix = ""] = m;
  const decimals = frac ? frac.length - 1 : 0;
  const to = Number(`${whole.replace(/,/g, "")}${frac}`);
  // CountUp derives decimal places from its endpoints; start at the smallest step so "29.70" keeps two.
  const from = decimals ? Number((10 ** -decimals).toFixed(decimals)) : 0;

  return (
    <span className="inline-grid">
      <span aria-hidden className="invisible [grid-area:1/1]">
        {text}
      </span>
      <span ref={liveRef} aria-hidden className="[grid-area:1/1]">
        {prefix}
        <CountUp to={to} from={from} duration={duration} separator={whole.includes(",") ? "," : ""} />
        {suffix}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
