import { Check, CheckCheck, CircleX, Clock, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";
import type { ConversationEntry } from "@dialbrio/types";
import { cn, formatDuration, formatListTime, formatPhone } from "@/lib/utils";
import { DispositionBadge } from "./index";

const statusIcon = {
  queued: <Clock className="size-3" aria-label="Queued" />,
  sent: <Check className="size-3" aria-label="Sent" />,
  delivered: <CheckCheck className="size-3" aria-label="Delivered" />,
  read: <CheckCheck className="size-3 text-brand-text" aria-label="Read" />,
  failed: <CircleX className="size-3 text-danger-text" aria-label="Failed" />,
  received: null,
};

/** SMS bubble or inline call record in a conversation thread. */
export function ConversationBubble({ entry }: { entry: ConversationEntry }) {
  const out = entry.direction === "outbound";

  if (entry.channel === "call" && entry.call) {
    const missed = entry.call.state === "failed" || entry.call.durationSec === 0;
    const Icon = missed ? PhoneMissed : out ? PhoneOutgoing : PhoneIncoming;
    return (
      <div className="flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary">
          <Icon className={cn("size-3.5", missed ? "text-danger-text" : "text-fg-muted")} aria-hidden />
          <span>
            {out ? "Outbound call" : "Inbound call"}
            {entry.agentName && ` · ${entry.agentName}`}
          </span>
          <span className="font-mono tabular">{missed ? "No answer" : formatDuration(entry.call.durationSec)}</span>
          {entry.call.disposition && <DispositionBadge code={entry.call.disposition} size="sm" />}
          <span className="font-mono text-fg-muted">{formatListTime(entry.at)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", out ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[min(80%,480px)] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          out ? "rounded-br-md bg-brand-solid text-brand-on" : "rounded-bl-md border border-border bg-surface text-fg",
          entry.status === "failed" && "border border-danger bg-danger-soft text-fg",
        )}
      >
        {entry.body}
      </div>
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-fg-muted">
        {out && entry.agentName && <span>{entry.agentName}</span>}
        {out && <span aria-hidden>·</span>}
        <span className="font-mono tabular">{formatListTime(entry.at)}</span>
        <span aria-hidden>·</span>
        <span className="font-mono tabular" title="Number used">
          {formatPhone(entry.fromNumber)}
        </span>
        {out && entry.status && statusIcon[entry.status]}
        {entry.status === "failed" && <span className="text-danger-text">Not delivered</span>}
      </div>
    </div>
  );
}
