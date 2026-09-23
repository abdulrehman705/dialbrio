import { plannedStatus } from "@dialbrio/types";
import { Tooltip } from "@/components/ui/tooltip";

/** Small mono "planned" marker for price-book highlights that aren't shipped yet. */
export function PlannedMarker({ highlight }: { highlight: string }) {
  const why = plannedStatus(highlight);
  if (!why) return null;
  return (
    <Tooltip content={why}>
      <span tabIndex={0} className="ml-1.5 inline-flex cursor-help rounded-[4px] border border-border px-1 font-mono text-[10.5px] leading-4 text-fg-muted align-[1px]">
        planned
        <span className="sr-only">: {why}</span>
      </span>
    </Tooltip>
  );
}
