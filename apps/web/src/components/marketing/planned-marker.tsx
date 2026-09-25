import { plannedStatus } from "@dialbrio/types";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Small mono "planned" marker for price-book highlights that aren't shipped yet.
 * `notes` comes from Sanity (per-highlight availability); without it, the code price book's rules apply.
 */
export function PlannedMarker({ highlight, notes }: { highlight: string; notes?: Record<string, string> }) {
  const why = notes ? notes[highlight] : plannedStatus(highlight);
  if (!why) return null;
  return (
    <Tooltip content={why}>
      <span tabIndex={0} className="ml-1.5 inline-flex cursor-help rounded-[4px] border border-border px-1 align-[1px] font-mono text-[10.5px] leading-4 text-fg-muted">
        planned
        <span className="sr-only">: {why}</span>
      </span>
    </Tooltip>
  );
}
