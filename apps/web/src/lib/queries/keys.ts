import type { ContactQuery, ConversationFilter, DateRange, ReportParams } from "@dialbrio/types";

/** Query-key factory. Keys include the active sub-account so tenant switches never show stale data. */
export const qk = {
  me: ["me"] as const,
  overview: (sub: string, range: DateRange) => ["overview", sub, range] as const,
  agents: (sub: string) => ["agents", sub] as const,
  contacts: (sub: string, q: ContactQuery) => ["contacts", sub, q] as const,
  contact: (sub: string, id: string) => ["contact", sub, id] as const,
  contactTimeline: (sub: string, id: string) => ["contact", sub, id, "timeline"] as const,
  contactCalls: (sub: string, id: string) => ["contact", sub, id, "calls"] as const,
  campaigns: (sub: string) => ["campaigns", sub] as const,
  campaign: (sub: string, id: string) => ["campaign", sub, id] as const,
  queues: (sub: string) => ["queues", sub] as const,
  queueStats: (sub: string) => ["queues", sub, "stats"] as const,
  queueItems: (sub: string, id: string) => ["queues", sub, id, "items"] as const,
  dialerSession: (sub: string) => ["dialer", sub, "session"] as const,
  playbook: (sub: string, campaignId: string) => ["playbook", sub, campaignId] as const,
  conversations: (sub: string, f: ConversationFilter, q?: string) => ["conversations", sub, f, q ?? ""] as const,
  conversationEntries: (sub: string, id: string) => ["conversation", sub, id] as const,
  report: (sub: string, p: ReportParams) => ["report", sub, p] as const,
  integrations: (sub: string) => ["integrations", sub] as const,
  numbers: (sub: string) => ["numbers", sub] as const,
  appointments: (sub: string) => ["appointments", sub] as const,
  billing: (org: string) => ["billing", org] as const,
  priceBook: ["price-book"] as const,
  settings: (sub: string, section: string) => ["settings", sub, section] as const,
};
