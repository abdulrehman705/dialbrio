import type {
  PriceBook,
  BillingOverview,
  ParallelLines,
  SettingsSection,
  SettingsValues,
  AgentActivity,
  Appointment,
  Call,
  Campaign,
  CampaignDraft,
  Contact,
  ContactQuery,
  Conversation,
  ConversationEntry,
  ConversationFilter,
  DateRange,
  DialerLead,
  DialerSession,
  DialQueue,
  DispositionInput,
  Integration,
  Me,
  NextAction,
  OverviewData,
  Page,
  PhoneNumber,
  Playbook,
  QueueItem,
  QueueStats,
  Report,
  ReportParams,
  TimelineEvent,
} from "@dialbrio/types";

/**
 * The repository contract between the UI and the backend.
 * Implemented by `mock/` (seeded demo data) and `http/` (real /v1 API).
 * UI components never call this directly — only via hooks in `lib/queries`.
 */
export interface DialBrioApi {
  // session
  getMe(): Promise<Me>;

  // overview
  getOverview(range: DateRange): Promise<OverviewData>;
  getAgentActivity(): Promise<AgentActivity[]>;

  // contacts
  listContacts(query: ContactQuery): Promise<Page<Contact>>;
  getContact(id: string): Promise<Contact>;
  getContactTimeline(id: string): Promise<TimelineEvent[]>;
  getContactCalls(id: string): Promise<Call[]>;

  // campaigns
  listCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign>;
  createCampaign(draft: CampaignDraft, launch: boolean): Promise<Campaign>;
  setCampaignStatus(id: string, status: "active" | "paused"): Promise<Campaign>;

  // queues
  listQueues(): Promise<DialQueue[]>;
  getQueueStats(): Promise<QueueStats>;
  getQueueItems(queueId: string): Promise<QueueItem[]>;
  reorderQueues(orderedIds: string[]): Promise<DialQueue[]>;
  updateQueue(id: string, patch: Partial<Pick<DialQueue, "enabled" | "maxAttempts" | "leadStates" | "callingWindow" | "retryRules">>): Promise<DialQueue>;

  // dialer
  getDialerSession(): Promise<DialerSession>;
  getNextLead(sessionId: string): Promise<DialerLead | null>;
  getPlaybook(campaignId: string): Promise<Playbook>;
  startCall(sessionId: string, contactId: string, callerId: string): Promise<{ callId: string }>;
  endCall(callId: string): Promise<void>;
  submitDisposition(callId: string, input: DispositionInput): Promise<{ nextAction: NextAction }>;
  setCallerId(sessionId: string, number: string): Promise<DialerSession>;
  setSessionLines(sessionId: string, lines: ParallelLines): Promise<DialerSession>;
  /** Leaves the pre-recorded voicemail and ends the agent leg; disposition is recorded as voicemail. */
  dropVoicemail(callId: string): Promise<{ nextAction: NextAction }>;

  // conversations
  listConversations(filter: ConversationFilter, q?: string): Promise<Conversation[]>;
  getConversationEntries(conversationId: string): Promise<ConversationEntry[]>;
  sendMessage(conversationId: string, body: string): Promise<ConversationEntry>;
  markConversationRead(conversationId: string): Promise<void>;

  // analytics
  getReport(params: ReportParams): Promise<Report>;

  // operations
  listIntegrations(): Promise<Integration[]>;
  listPhoneNumbers(): Promise<PhoneNumber[]>;
  listAppointments(): Promise<Appointment[]>;

  // billing
  getBilling(): Promise<BillingOverview>;
  /** Plans, usage rates and trial terms (CMS content, served by app/api/price-book). */
  getPriceBook(): Promise<PriceBook>;

  // settings
  getSettings(section: SettingsSection): Promise<SettingsValues>;
  updateSettings(section: SettingsSection, values: SettingsValues): Promise<SettingsValues>;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public requestId?: string,
  ) {
    super(message);
  }
}
