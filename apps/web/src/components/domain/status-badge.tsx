import { Badge, type BadgeProps } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { StatusMeta } from "./status-config";

interface StatusBadgeProps extends Omit<BadgeProps, "tone"> {
  meta: StatusMeta;
  /** Show description in a tooltip. */
  explain?: boolean;
  labelOverride?: string;
}

/** Colour + icon/dot + text. Never colour alone. */
export function StatusBadge({ meta, explain, labelOverride, className, size, ...props }: StatusBadgeProps) {
  const Icon = meta.icon;
  const badge = (
    <Badge tone={meta.tone} size={size} className={cn(explain && "cursor-help", className)} {...props}>
      {Icon ? <Icon aria-hidden className={cn(meta.label === "Preparing" || meta.label === "Syncing" ? "animate-spin" : undefined)} /> : meta.dot ? <StatusDot tone={meta.dot} live={meta.live} /> : null}
      {labelOverride ?? meta.label}
    </Badge>
  );
  if (explain && meta.description) {
    return (
      <Tooltip content={meta.description}>
        <span tabIndex={0} className="inline-flex rounded-full">
          {badge}
        </span>
      </Tooltip>
    );
  }
  return badge;
}
