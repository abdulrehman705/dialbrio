import type {
  AgentActivity,
  ID,
  ISODateString,
  AttentionItem,
  CallingWindow,
  Campaign,
  Contact,
  Conversation,
  DialMode,
  DialStrategyKind,
  DispositionCode,
  LeadState,
  NumberHealth,
  Organization,
  RetryRule,
  Role,
  SubAccount,
  TimelineEvent,
  User,
} from "./domain";

/** Standard error envelope returned by the API. */
export interface ApiErrorBody { error: { code: string; message: string; details?: unknown; requestId: string } }

export interface Page<T> { items: T[]; page: number; pageSize: number; total: number }
export interface CursorPage<T> { items: T[]; nextCursor: string | null }

export type DateRange = "today" | "7d" | "30d" | "90d";

export interface ContactQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  leadState?: string;
  campaignId?: ID;
  ownerId?: ID;
}

export type ConversationFilter = "all" | "unread" | "mine" | "unassigned" | "team";

export interface DispositionInput {
  code: DispositionCode;
  notes?: string;
  callbackAt?: ISODateString;
  appointment?: { calendarId: ID; startsAt: ISODateString };
}

// ── Response DTOs (screen-level read models) ────────────────────────────

export interface Me {
  user: User;
  role: Role;
  organization: Organization;
  subAccounts: SubAccount[];
  activeSubAccountId: string;
}

export interface Kpi { value: number; previous: number }

export interface OverviewData {
  kpis: {
    callsToday: Kpi;
    connectRate: Kpi; // ratio 0..1
    appointments: Kpi;
    speedToLeadSec: Kpi;
    activeAgents: Kpi & { total: number };
    queueWaiting: Kpi & { oldestMinutes: number };
  };
  callActivity: { hour: string; calls: number; connected: number }[];
  queueHealth: { queueId: string; name: string; waiting: number; oldestMinutes: number; slaMinutes: number; enabled: boolean }[];
  lifecycle: Record<LeadState, number>;
  funnel: { stage: string; value: number }[];
  numberHealth: Record<NumberHealth, number>;
  recentConversations: Conversation[];
  attention: AttentionItem[];
}

export interface QueueStats {
  waiting: number;
  activeCalls: number;
  availableAgents: number;
  oldestLeadMinutes: number;
  avgWaitMinutes: number;
  throughputPerHour: number;
  byState: Record<LeadState, number>;
}

export interface DialerSession {
  id: string;
  campaign: Pick<Campaign, "id" | "name" | "dialMode" | "dialStrategy">;
  callerId: string;
  callerIds: { number: string; label: string; health: NumberHealth }[];
  queueName: string;
  queueWaiting: number;
  startedAt: string;
  stats: { calls: number; connected: number; appointments: number; talkTimeSec: number; voicemailsDropped: number };
  autoDialNext: boolean;
  /** Parallel lines for this session (1 = power dial). Campaign caps the maximum. */
  lines: import("./domain").ParallelLines;
  maxLines: import("./domain").ParallelLines;
  /** Pre-recorded voicemail available for one-click drop. */
  voicemailDrop: { id: string; name: string; durationSec: number } | null;
}

export interface BillingUsageLine { id: import("./pricing").UsageItemId; label: string; quantity: number; included: number; amountCents: number; rate: string }

export interface BillingOverview {
  planId: import("./pricing").PlanId;
  interval: "monthly" | "annual";
  periodStart: string;
  periodEnd: string;
  seats: { included: number; used: number; extra: number };
  subAccounts: number;
  usage: BillingUsageLine[];
  platformCents: number;
  seatsCents: number;
  usageCents: number;
  estimatedTotalCents: number;
  spendCapCents: number | null;
  bySubAccount: { subAccountId: string; name: string; minutes: number; sms: number; numbers: number; costCents: number; rebilledCents: number }[];
  invoices: { id: string; period: string; totalCents: number; status: "paid" | "open" | "failed" }[];
  paymentMethod: { brand: string; last4: string; expires: string } | null;
}

export interface ScriptSection { id: string; title: string; body: string }
export interface Playbook { id: string; name: string; sections: ScriptSection[]; objections: { objection: string; response: string }[] }

export interface DialerLead {
  contact: Contact;
  queueReason: string;
  lastConversation?: { at: string; summary: string; agentName: string; disposition?: DispositionCode };
  history: TimelineEvent[];
  complianceBlock?: { code: "dnc" | "calling_window" | "consent"; message: string };
}

export interface ReportParams {
  range: DateRange;
  scope: "organization" | "subaccount" | "team" | "agent" | "campaign" | "number";
  scopeId?: string;
}

export interface Report {
  totals: {
    calls: number;
    connected: number;
    connectRate: number;
    talkTimeSec: number;
    avgCallSec: number;
    appointments: number;
    appointmentRate: number;
    speedToLeadSec: number;
    retries: number;
    noAnswers: number;
    dnc: number;
    agentIdleSec: number;
  };
  previous: Report["totals"];
  series: { date: string; calls: number; connected: number; appointments: number }[];
  connectByHour: { hour: string; rate: number }[];
  dispositions: { code: DispositionCode; count: number }[];
  agents: { userId: string; name: string; initials: string; calls: number; connected: number; appointments: number; talkTimeSec: number; idleSec: number }[];
  campaigns: { campaignId: string; name: string; calls: number; connectRate: number; appointments: number; appointmentRate: number }[];
  speedToLeadBuckets: { bucket: string; leads: number }[];
}

export interface CampaignDraft {
  name: string;
  description?: string;
  dialStrategy: DialStrategyKind;
  dialMode: DialMode;
  /** Parallel lines (1–4); used when dialMode is "parallel". */
  lines: import("./domain").ParallelLines;
  /** Operator confirmed leads have consent for dialer calls (required for parallel mode). */
  parallelAck: boolean;
  /** Dial a new lead within 10s of it arriving. */
  speedToLead: boolean;
  leadSource: { type: "ghl_tag" | "ghl_pipeline" | "ghl_smart_list" | "csv"; value: string };
  leadStates: LeadState[];
  queuePriority: number;
  callingWindow: CallingWindow;
  maxAttempts: number;
  retryRules: RetryRule[];
  dispositions: DispositionCode[];
  followUp: { onNoAnswerSms: boolean; smsTemplate?: string; callbackReminderMinutes: number; voicemailDrop: boolean };
  callerIds: string[];
  numberRotation: "round_robin" | "local_presence" | "fixed";
  agentIds: string[];
}

export type { AgentActivity };

// ── Settings ────────────────────────────────────────────────────────────
export const SETTINGS_SECTIONS = [
  "general", "organization", "team", "dialer", "numbers", "compliance", "crm", "ai", "notifications", "billing", "developer",
] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
/** Section payloads are validated by per-section Zod schemas (web forms now, API DTOs later). */
export type SettingsValues = Record<string, unknown>;
