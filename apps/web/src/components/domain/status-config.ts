import {
  Ban,
  Calendar,
  CalendarCheck,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
  Clock,
  Flame,
  Hourglass,
  LoaderCircle,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Snowflake,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  UserX,
  Voicemail,
  type LucideIcon,
} from "lucide-react";
import type {
  AgentStatus,
  CallState,
  CampaignStatus,
  ComplianceStatus,
  CRMSyncState,
  DispositionCode,
  IntegrationStatus,
  LeadState,
  MessageStatus,
  NumberHealth,
} from "@dialbrio/types";
import type { BadgeTone } from "@/components/ui/badge";
import type { StatusDotTone } from "@/components/ui/status-dot";

/** Single source for status labels, tones and icons (docs/design.md §18). */
export interface StatusMeta {
  label: string;
  tone: BadgeTone;
  icon?: LucideIcon;
  dot?: StatusDotTone;
  live?: boolean;
  description?: string;
}

export const LEAD_STATE_META: Record<LeadState, StatusMeta> = {
  fresh: { label: "Fresh", tone: "fresh", icon: CircleDot, description: "New in the last 24h with fewer than 3 attempts" },
  warm: { label: "Warm", tone: "warm", icon: Flame, description: "Connected or replied in the last 14 days" },
  aged: { label: "Aged", tone: "aged", icon: Hourglass, description: "1–30 days old, not yet connected, attempts remaining" },
  zombie: { label: "Zombie", tone: "zombie", icon: CircleDashed, description: "30+ days without connection or attempts exhausted" },
};

export const CALL_STATE_META: Record<CallState, StatusMeta> = {
  idle: { label: "Idle", tone: "neutral", dot: "neutral" },
  preparing: { label: "Preparing", tone: "neutral", icon: LoaderCircle },
  dialing: { label: "Dialing", tone: "info", icon: PhoneOutgoing, dot: "ringing", live: true },
  ringing: { label: "Ringing", tone: "info", icon: PhoneOutgoing, dot: "ringing", live: true },
  connected: { label: "Connected", tone: "success", icon: PhoneCall, dot: "connected", live: true },
  wrapping_up: { label: "Wrapping up", tone: "warning", icon: Clock, dot: "wrap" },
  completed: { label: "Completed", tone: "neutral", icon: CircleCheck },
  failed: { label: "Failed", tone: "danger", icon: PhoneOff },
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

export const AGENT_STATUS_META: Record<AgentStatus, StatusMeta> = {
  available: { label: "Available", tone: "success", dot: "success" },
  on_call: { label: "On call", tone: "info", dot: "connected", live: true, icon: PhoneCall },
  wrap_up: { label: "Wrap-up", tone: "warning", dot: "wrap" },
  break: { label: "Break", tone: "neutral", dot: "neutral" },
  offline: { label: "Offline", tone: "outline", dot: "neutral" },
};

export const NUMBER_HEALTH_META: Record<NumberHealth, StatusMeta> = {
  healthy: { label: "Healthy", tone: "success", icon: CircleCheck, description: "Answer rate normal, no spam labels detected" },
  watch: { label: "Watch", tone: "warning", icon: TriangleAlert, description: "Answer rate dropping or spam signal from one carrier" },
  at_risk: { label: "At risk", tone: "danger", icon: TriangleAlert, description: "Labeled as spam by a carrier or answer rate collapsed" },
  cooling_down: { label: "Cooling down", tone: "info", icon: Snowflake, description: "Temporarily removed from rotation to recover reputation" },
};

export const CAMPAIGN_STATUS_META: Record<CampaignStatus, StatusMeta> = {
  draft: { label: "Draft", tone: "outline", dot: "neutral" },
  active: { label: "Active", tone: "success", dot: "success", live: true },
  paused: { label: "Paused", tone: "warning", dot: "warning" },
  completed: { label: "Completed", tone: "neutral", dot: "neutral" },
  archived: { label: "Archived", tone: "outline", dot: "neutral" },
};

export const CRM_SYNC_META: Record<CRMSyncState, StatusMeta> = {
  synced: { label: "Synced to CRM", tone: "success", icon: CircleCheck },
  syncing: { label: "Syncing", tone: "info", icon: LoaderCircle },
  pending: { label: "Sync pending", tone: "neutral", icon: Clock },
  failed: { label: "Sync failed", tone: "danger", icon: CircleX },
};

export const COMPLIANCE_META: Record<ComplianceStatus, StatusMeta> = {
  approved: { label: "Approved", tone: "success", icon: CircleCheck },
  pending: { label: "Pending", tone: "warning", icon: Clock },
  action_needed: { label: "Action needed", tone: "danger", icon: TriangleAlert },
  rejected: { label: "Rejected", tone: "danger", icon: CircleX },
  not_started: { label: "Not started", tone: "outline", icon: CircleDashed },
};

export const INTEGRATION_STATUS_META: Record<IntegrationStatus, StatusMeta> = {
  connected: { label: "Connected", tone: "success", dot: "success" },
  not_connected: { label: "Not connected", tone: "outline", dot: "neutral" },
  needs_attention: { label: "Needs attention", tone: "warning", icon: TriangleAlert },
  error: { label: "Error", tone: "danger", icon: CircleX },
};

export const MESSAGE_STATUS_META: Record<MessageStatus, StatusMeta> = {
  queued: { label: "Queued", tone: "neutral", icon: Clock },
  sent: { label: "Sent", tone: "neutral" },
  delivered: { label: "Delivered", tone: "success" },
  read: { label: "Read", tone: "success" },
  failed: { label: "Failed", tone: "danger", icon: CircleX },
  received: { label: "Received", tone: "neutral" },
};

export const CALL_DIRECTION_ICON = { outbound: PhoneOutgoing, inbound: PhoneIncoming } as const;
export const APPOINTMENT_ICON = Calendar;
