import type { DialStrategyKind, ID } from "@dialbrio/types";

/**
 * Queue Engine → DialStrategy → Call Outcome. Campaigns select a strategy by kind; the queue, lead,
 * call, disposition, compliance and reporting models are identical for both.
 */
export interface DialContext {
  organizationId: ID;
  subAccountId: ID;
  campaignId: ID;
  contactId: ID;
  reservationId: ID;
  callerId: string;
  agentId?: ID; // human strategy only
}

export interface DialStrategy {
  readonly kind: DialStrategyKind;
  /** Called after ComplianceGate has approved the attempt. */
  place(ctx: DialContext): Promise<{ callId: ID }>;
  cancel(callId: ID): Promise<void>;
}
