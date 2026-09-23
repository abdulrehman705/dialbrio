/**
 * Core DialBrio domain types. Shared by web, api and worker.
 * Enum-like unions are declared as `as const` arrays so they can drive UI and validation.
 */

export type ID = string;
export type ISODateString = string;

// ── Tenancy ─────────────────────────────────────────────────────────────
export const ROLES = ["admin", "manager", "agent"] as const;
export type Role = (typeof ROLES)[number];

export interface Organization { id: ID; name: string; slug: string }
export interface SubAccount { id: ID; organizationId: ID; name: string; crmLocationId?: string; timezone: string }
export interface Team { id: ID; organizationId: ID; subAccountId: ID; name: string }

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

export interface Membership { userId: ID; organizationId: ID; subAccountId: ID | null; role: Role }

// ── Lead lifecycle ──────────────────────────────────────────────────────
export const LEAD_STATES = ["fresh", "warm", "aged", "zombie"] as const;
export type LeadState = (typeof LEAD_STATES)[number];

export const LEAD_STAGES = ["new", "attempting", "connected", "qualified", "callback", "appointment", "lost", "dnc"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export interface Contact {
  id: ID;
  subAccountId: ID;
  firstName: string;
  lastName: string;
  phone: string; // E.164
  email?: string;
  source: string;
  leadState: LeadState;
  stage: LeadStage;
  campaignId?: ID;
  campaignName?: string;
  ownerId?: ID;
  ownerName?: string;
  tags: string[];
  attempts: number;
  lastContactAt?: ISODateString;
  nextAction?: NextAction;
  createdAt: ISODateString;
  timezone: string;
  city?: string;
  state?: string;
  customFields: Record<string, string>;
  crmSync: CRMSyncState;
  consent: ConsentState;
  aiSummary?: AISummary;
}

export interface NextAction { type: NextActionType; at?: ISODateString; label: string }
export const NEXT_ACTION_TYPES = ["call", "retry", "callback", "sms", "appointment", "none"] as const;
export type NextActionType = (typeof NEXT_ACTION_TYPES)[number];

export type ConsentState = "granted" | "unknown" | "revoked";
export type CRMSyncState = "synced" | "syncing" | "pending" | "failed";

// ── Campaigns & queues ──────────────────────────────────────────────────
export const CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed", "archived"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type DialStrategyKind = "human" | "ai";
/** preview: agent reviews first · power: one line, auto-next · parallel: up to 4 lines, first live answer is bridged (AMD) · progressive: dial on agent availability. */
export type DialMode = "preview" | "power" | "parallel" | "progressive";
export type ParallelLines = 1 | 2 | 3 | 4;

export interface Campaign {
  id: ID;
  subAccountId: ID;
  name: string;
  status: CampaignStatus;
  dialStrategy: DialStrategyKind;
  dialMode: DialMode;
  /** Parallel lines when dialMode is "parallel". */
  lines?: ParallelLines;
  speedToLead?: boolean;
  voicemailDrop?: boolean;
  queueId: ID;
  queueName: string;
  leads: number;
  attempts: number;
  connected: number;
  appointments: number;
  agentIds: ID[];
  callerIds: string[];
  createdAt: ISODateString;
  leadSource: string;
}

export interface CallingWindow { days: number[]; start: string; end: string; timezone: "contact" | string }

export interface RetryRule { disposition: DispositionCode; delayMinutes: number; maxAttempts: number }

export interface DialQueue {
  id: ID;
  name: string;
  priority: number;
  enabled: boolean;
  leadStates: LeadState[];
  sources: string[];
  campaignIds: ID[];
  maxAttempts: number;
  retryRules: RetryRule[];
  callingWindow: CallingWindow;
  waiting: number;
  oldestWaitMinutes: number;
  avgWaitMinutes: number;
  throughputPerHour: number;
}

export interface QueueItem {
  id: ID;
  queueId: ID;
  contactId: ID;
  contactName: string;
  phone: string;
  leadState: LeadState;
  attempts: number;
  enqueuedAt: ISODateString;
  eligibleAt: ISODateString;
  /** Human-readable explanation of why this lead is in this queue at this position. */
  reason: string;
  reservedBy?: string;
}

// ── Calls ───────────────────────────────────────────────────────────────
export const CALL_STATES = ["idle", "preparing", "dialing", "ringing", "connected", "wrapping_up", "completed", "failed"] as const;
export type CallState = (typeof CALL_STATES)[number];

export const DISPOSITION_CODES = [
  "interested", "appointment", "callback", "no_answer", "busy", "voicemail", "not_interested", "wrong_number", "dnc",
] as const;
export type DispositionCode = (typeof DISPOSITION_CODES)[number];

export type CallDirection = "outbound" | "inbound";

export interface Call {
  id: ID;
  contactId: ID;
  contactName: string;
  agentId?: ID;
  agentName?: string;
  campaignId?: ID;
  campaignName?: string;
  direction: CallDirection;
  fromNumber: string;
  toNumber: string;
  state: CallState;
  startedAt: ISODateString;
  durationSec: number;
  disposition?: DispositionCode;
  recordingUrl?: string;
  failureReason?: string;
}

export interface TranscriptSegment { id: ID; speaker: "agent" | "contact" | "ai"; text: string; atSec: number }

// ── Agents ──────────────────────────────────────────────────────────────
export const AGENT_STATUSES = ["available", "on_call", "wrap_up", "break", "offline"] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export interface AgentActivity {
  userId: ID;
  name: string;
  initials: string;
  status: AgentStatus;
  statusSince: ISODateString;
  campaignName?: string;
  currentContact?: string;
  callsToday: number;
  connectsToday: number;
  appointmentsToday: number;
  talkTimeSec: number;
}

// ── Conversations ───────────────────────────────────────────────────────
export type Channel = "sms" | "call";
export type MessageStatus = "queued" | "sent" | "delivered" | "read" | "failed" | "received";

export interface Conversation {
  id: ID;
  contactId: ID;
  contactName: string;
  contactPhone: string;
  assigneeId?: ID;
  assigneeName?: string;
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: ISODateString;
  lastChannel: Channel;
  numberUsed: string;
  leadState: LeadState;
  campaignName?: string;
}

export interface ConversationEntry {
  id: ID;
  conversationId: ID;
  channel: Channel;
  direction: "inbound" | "outbound";
  body?: string;
  status?: MessageStatus;
  at: ISODateString;
  agentName?: string;
  fromNumber: string;
  /** Present for call entries. */
  call?: { durationSec: number; disposition?: DispositionCode; state: CallState };
}

// ── Numbers, compliance, integrations ───────────────────────────────────
export const NUMBER_HEALTH = ["healthy", "watch", "at_risk", "cooling_down"] as const;
export type NumberHealth = (typeof NUMBER_HEALTH)[number];

export interface PhoneNumber {
  id: ID;
  number: string;
  friendlyName: string;
  campaignName?: string;
  capabilities: ("voice" | "sms" | "mms")[];
  health: NumberHealth;
  spamLabel: "clean" | "suspected" | "labeled";
  a2p: ComplianceStatus;
  stirShaken: "A" | "B" | "C" | "unknown";
  dailyCalls: number;
  answerRate: number;
  status: "active" | "paused" | "released";
}

export type ComplianceStatus = "approved" | "pending" | "action_needed" | "rejected" | "not_started";

export const INTEGRATION_STATUSES = ["connected", "not_connected", "needs_attention", "error"] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];
export type IntegrationProvider = "ghl" | "twilio" | "llm" | "stt" | "storage" | "stripe" | "sentry";

export interface IntegrationCheck { label: string; status: "ok" | "warning" | "error" | "unknown"; detail: string }

export interface Integration {
  provider: IntegrationProvider;
  name: string;
  category: "CRM" | "Telephony" | "AI" | "Infrastructure" | "Billing" | "Monitoring";
  description: string;
  status: IntegrationStatus;
  connectedAccount?: string;
  lastSyncAt?: ISODateString;
  checks: IntegrationCheck[];
  metrics?: { label: string; value: string }[];
  required: boolean;
}

// ── Appointments ────────────────────────────────────────────────────────
export interface Appointment {
  id: ID;
  contactId: ID;
  contactName: string;
  agentName: string;
  campaignName: string;
  calendarName: string;
  startsAt: ISODateString;
  status: "confirmed" | "pending" | "cancelled" | "no_show" | "completed";
}

// ── AI (structured, never free-form mutations) ──────────────────────────
export type Intent = "INTERESTED" | "CALLBACK" | "APPOINTMENT" | "NOT_INTERESTED" | "WRONG_NUMBER" | "DNC_REQUEST" | "UNKNOWN";

export interface AIIntentResult {
  intent: Intent;
  confidence: number; // 0..1
  callbackAt?: ISODateString;
  summary: string;
  objections: string[];
}

export interface AISummary { text: string; confidence: number; generatedAt: ISODateString; model: string }

// ── Alerts ──────────────────────────────────────────────────────────────
export type AlertSeverity = "critical" | "warning" | "info";
export interface AttentionItem {
  id: ID;
  severity: AlertSeverity;
  kind: "crm_sync" | "a2p" | "number_health" | "stale_queue" | "campaign_exhausted" | "usage_limit";
  title: string;
  detail: string;
  at: ISODateString;
  action?: { label: string; href: string };
}

// ── Timeline ────────────────────────────────────────────────────────────
export type TimelineEventKind =
  | "lead_created" | "campaign_added" | "call_attempt" | "no_answer" | "sms_sent" | "sms_received"
  | "callback_scheduled" | "connected" | "qualified" | "appointment" | "note" | "state_changed" | "crm_sync";

export interface TimelineEvent { id: ID; kind: TimelineEventKind; title: string; detail?: string; at: ISODateString; actor?: string }
