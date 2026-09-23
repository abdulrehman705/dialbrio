import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
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
                <dd className="font-display text-[28px] leading-8 font-bold tracking-[-0.03em] text-fg">{k.value}</dd>
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
