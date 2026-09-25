import { Ban, CalendarCheck, CircleDashed, CircleDot, Clock, Flame, Hourglass, PhoneMissed, PhoneOff, ThumbsDown, ThumbsUp, UserX, Voicemail, type LucideIcon } from "lucide-react";
import type { DispositionCode, LeadState } from "@/lib/vocabulary";
import { Badge, type BadgeProps, type BadgeTone } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Labels, tones and icons for the product states the site illustrates (docs/design.md §18). */
export interface StatusMeta {
  label: string;
  tone: BadgeTone;
  icon?: LucideIcon;
  description?: string;
}

export const LEAD_STATE_META: Record<LeadState, StatusMeta> = {
  fresh: { label: "Fresh", tone: "fresh", icon: CircleDot, description: "New in the last 24h with fewer than 3 attempts" },
  warm: { label: "Warm", tone: "warm", icon: Flame, description: "Connected or replied in the last 14 days" },
  aged: { label: "Aged", tone: "aged", icon: Hourglass, description: "1–30 days old, not yet connected, attempts remaining" },
  zombie: { label: "Zombie", tone: "zombie", icon: CircleDashed, description: "30+ days without connection or attempts exhausted" },
};

export const DISPOSITION_META: Record<DispositionCode, StatusMeta & { shortcut: string; group: "positive" | "retry" | "negative" }> = {
  interested: { label: "Interested", tone: "success", icon: ThumbsUp, shortcut: "1", group: "positive" },
  appointment: { label: "Appointment", tone: "success", icon: CalendarCheck, shortcut: "2", group: "positive" },
  callback: { label: "Callback", tone: "brand", icon: Clock, shortcut: "3", group: "positive" },
  no_answer: { label: "No answer", tone: "neutral", icon: PhoneMissed, shortcut: "4", group: "retry" },
  busy: { label: "Busy", tone: "neutral", icon: PhoneOff, shortcut: "5", group: "retry" },
  voicemail: { label: "Voicemail", tone: "neutral", icon: Voicemail, shortcut: "6", group: "retry" },
  not_interested: { label: "Not interested", tone: "warning", icon: ThumbsDown, shortcut: "7", group: "negative" },
  wrong_number: { label: "Wrong number", tone: "warning", icon: UserX, shortcut: "8", group: "negative" },
  dnc: { label: "Do not call", tone: "danger", icon: Ban, shortcut: "9", group: "negative" },
};

/** Colour + icon + text. Never colour alone. */
export function LeadStateBadge({ state, size, explain = true }: { state: LeadState; size?: BadgeProps["size"]; explain?: boolean }) {
  const meta = LEAD_STATE_META[state];
  const Icon = meta.icon;
  const badge = (
    <Badge tone={meta.tone} size={size} className={cn(explain && "cursor-help")}>
      {Icon && <Icon aria-hidden />}
      {meta.label}
    </Badge>
  );
  if (!explain || !meta.description) return badge;
  return (
    <Tooltip content={meta.description}>
      <span tabIndex={0} className="inline-flex rounded-full">
        {badge}
      </span>
    </Tooltip>
  );
}
