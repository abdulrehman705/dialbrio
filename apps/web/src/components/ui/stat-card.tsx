import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Relative change, e.g. 0.12 = +12%. */
  delta?: number;
  deltaLabel?: string;
  /** When true, a decrease is good (e.g. speed to lead, wait time). */
  invertDelta?: boolean;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

/** Restrained KPI card. All KPI cards share one style — no rainbow fills (docs/design.md §16). */
export function StatCard({ label, value, delta, deltaLabel = "vs yesterday", invertDelta, hint, icon, footer, className, loading }: StatCardProps) {
  const good = delta === undefined ? undefined : invertDelta ? delta < 0 : delta > 0;
  const flat = delta !== undefined && Math.abs(delta) < 0.005;
  const DeltaIcon = flat ? Minus : delta && delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-xs", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-fg-secondary">{label}</span>
        {icon && <span className="text-fg-muted [&_svg]:size-4">{icon}</span>}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <div className="font-display text-[30px] leading-8 font-bold tracking-[-0.03em] text-fg">{value}</div>
          <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium tabular",
                  flat ? "text-fg-muted" : good ? "text-success-text" : "text-danger-text",
                )}
              >
                <DeltaIcon className="size-3.5" aria-hidden />
                <span className="sr-only">{flat ? "No change" : delta > 0 ? "Up" : "Down"}</span>
                {Math.abs(delta * 100).toFixed(1)}%
              </span>
            )}
            {delta !== undefined && <span className="text-fg-muted">{deltaLabel}</span>}
            {hint && <span className="text-fg-muted">{hint}</span>}
          </div>
          {footer}
        </>
      )}
    </div>
  );
}
