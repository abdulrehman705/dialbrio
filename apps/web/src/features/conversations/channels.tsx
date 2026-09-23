import { MessageSquare, PhoneCall, type LucideIcon } from "lucide-react";
import type { Channel, ConversationEntry } from "@dialbrio/types";
import { ConversationBubble } from "@/components/domain/conversation-bubble";

/**
 * Channel registry. Each channel declares how its entries render and how it is labelled.
 * Adding email / WhatsApp later means adding a `Channel` value and one entry here —
 * the list, thread and composer do not change.
 */
export interface ChannelDefinition {
  label: string;
  icon: LucideIcon;
  render: (entry: ConversationEntry) => React.ReactNode;
  /** Whether agents can compose on this channel from the inbox. */
  composable: boolean;
}

export const CHANNELS: Record<Channel, ChannelDefinition> = {
  sms: { label: "SMS", icon: MessageSquare, render: (e) => <ConversationBubble entry={e} />, composable: true },
  call: { label: "Call", icon: PhoneCall, render: (e) => <ConversationBubble entry={e} />, composable: false },
};

export function renderEntry(entry: ConversationEntry) {
  return CHANNELS[entry.channel].render(entry);
}

/** GSM-7 single-segment limit; multi-part messages use 153 chars per segment. */
export function smsSegments(text: string) {
  if (!text.length) return 0;
  return text.length <= 160 ? 1 : Math.ceil(text.length / 153);
}
