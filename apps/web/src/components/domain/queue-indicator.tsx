import { ListOrdered } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

/** Compact "N waiting · oldest Xm" indicator used in session headers and queue cards. */
export function QueueIndicator({ waiting, oldestMinutes, className }: { waiting: number; oldestMinutes?: number; className?: string }) {
  const stale = (oldestMinutes ?? 0) > 60;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-fg-secondary", className)}>
      <ListOrdered className="size-4 text-fg-muted" aria-hidden />
      <span className="font-medium text-fg tabular">{formatNumber(waiting)}</span> waiting
      {oldestMinutes !== undefined && (
        <span className={cn("tabular", stale ? "text-warning-text" : "text-fg-muted")}>· oldest {oldestMinutes}m</span>
      )}
    </span>
  );
}
