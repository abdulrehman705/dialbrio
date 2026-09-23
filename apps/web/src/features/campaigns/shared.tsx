import { Bot } from "lucide-react";
import type { AgentActivity, Campaign } from "@dialbrio/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const connectRate = (c: Campaign) => (c.attempts ? c.connected / c.attempts : 0);
/** Conversion = appointments ÷ leads in campaign. */
export const conversion = (c: Campaign) => (c.leads ? c.appointments / c.leads : 0);

export function StrategyBadge({ strategy, size }: { strategy: Campaign["dialStrategy"]; size?: "sm" | "md" }) {
  return strategy === "ai" ? (
    <Badge tone="ai" size={size}>
      <Bot aria-hidden /> AI voice
    </Badge>
  ) : (
    <span className="text-fg-secondary">Reps</span>
  );
}

export function AgentStack({ ids, agents, max = 3, className }: { ids: string[]; agents?: AgentActivity[]; max?: number; className?: string }) {
  if (!ids.length) return <span className="text-xs text-fg-muted">None</span>;
  const people = ids.map((id) => agents?.find((a) => a.userId === id)).filter(Boolean) as AgentActivity[];
  const shown = people.slice(0, max);
  const label = people.map((p) => p.name).join(", ") || `${ids.length} agents`;
  return (
    <span className={cn("inline-flex items-center", className)} aria-label={`${ids.length} agents: ${label}`} title={label}>
      <span className="flex -space-x-2" aria-hidden>
        {shown.map((p) => (
          <span key={p.userId} className="rounded-full bg-surface ring-2 ring-surface">
            <Avatar name={p.name} initials={p.initials} size="sm" />
          </span>
        ))}
      </span>
      {ids.length > max && (
        <span className="ml-1.5 text-xs text-fg-muted tabular" aria-hidden>
          +{ids.length - max}
        </span>
      )}
    </span>
  );
}
