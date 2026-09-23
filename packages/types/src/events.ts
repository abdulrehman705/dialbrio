import type { AgentStatus, CallState, DispositionCode, ID, ISODateString, LeadState, MessageStatus, NumberHealth } from "./domain";

/** Envelope for internal domain events (Redis pub/sub → SSE). */
export interface DomainEvent<TType extends string, TPayload> {
  id: ID;
  type: TType;
  organizationId: ID;
  subAccountId: ID;
  occurredAt: ISODateString;
  correlationId: string;
  payload: TPayload;
}

export type DialBrioEvent =
  | DomainEvent<"contact.upserted", { contactId: ID; source: string; isNew: boolean }>
  | DomainEvent<"lead.state_changed", { contactId: ID; from: LeadState; to: LeadState; reason: string }>
  | DomainEvent<"queue.item_added", { queueId: ID; contactId: ID; reason: string }>
  | DomainEvent<"queue.item_reserved", { queueId: ID; contactId: ID; userId: ID; ttlSec: number }>
  | DomainEvent<"queue.item_released", { queueId: ID; contactId: ID }>
  | DomainEvent<"call.state_changed", { callId: ID; state: CallState; providerReason?: string }>
  | DomainEvent<"call.completed", { callId: ID; durationSec: number; disposition?: DispositionCode }>
  | DomainEvent<"disposition.recorded", { callId: ID; code: DispositionCode; nextAction: string }>
  | DomainEvent<"message.received", { conversationId: ID; messageId: ID }>
  | DomainEvent<"message.status_changed", { conversationId: ID; messageId: ID; status: MessageStatus }>
  | DomainEvent<"agent.status_changed", { userId: ID; status: AgentStatus }>
  | DomainEvent<"crm.sync_completed", { entity: string; entityId: ID }>
  | DomainEvent<"crm.sync_failed", { entity: string; entityId: ID; error: string }>
  | DomainEvent<"number.health_changed", { phoneNumberId: ID; from: NumberHealth; to: NumberHealth }>;

/** Persisted record of every inbound webhook — the idempotency ledger. */
export interface WebhookEventRecord {
  id: ID;
  provider: "ghl" | "twilio" | "stripe";
  eventId: string;
  eventType: string;
  receivedAt: ISODateString;
  processedAt: ISODateString | null;
  status: "received" | "processing" | "processed" | "ignored_duplicate" | "ignored_stale" | "failed";
  payloadHash: string;
  error?: string;
}
