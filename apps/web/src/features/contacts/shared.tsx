import { CalendarCheck, Clock, MessageSquare, Minus, PhoneOutgoing, RefreshCw, type LucideIcon } from "lucide-react";
import type { NextAction, NextActionType } from "@dialbrio/types";
import { cn } from "@/lib/utils";

export const NEXT_ACTION_ICON: Record<NextActionType, LucideIcon> = {
  call: PhoneOutgoing,
  retry: RefreshCw,
  callback: Clock,
  sms: MessageSquare,
  appointment: CalendarCheck,
  none: Minus,
};

export function NextActionLabel({ action, className }: { action?: NextAction; className?: string }) {
  if (!action) return <span className="text-fg-muted">—</span>;
  return (
    <span className={cn("block truncate", action.type === "none" ? "text-fg-muted" : action.type === "call" ? "font-medium text-brand-text" : "text-fg-secondary", className)}>
      {action.label}
    </span>
  );
}

export const STAGE_LABEL: Record<string, string> = {
  new: "New",
  attempting: "Attempting",
  connected: "Connected",
  qualified: "Qualified",
  callback: "Callback",
  appointment: "Appointment",
  lost: "Lost",
  dnc: "Do not call",
};
