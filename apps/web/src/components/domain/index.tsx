import type {
  AgentStatus as AgentStatusT,
  CallState,
  CampaignStatus as CampaignStatusT,
  ComplianceStatus as ComplianceStatusT,
  CRMSyncState,
  DispositionCode,
  IntegrationStatus as IntegrationStatusT,
  LeadState,
  NumberHealth as NumberHealthT,
} from "@dialbrio/types";
import { StatusBadge } from "./status-badge";
import {
  AGENT_STATUS_META,
  CALL_STATE_META,
  CAMPAIGN_STATUS_META,
  COMPLIANCE_META,
  CRM_SYNC_META,
  DISPOSITION_META,
  INTEGRATION_STATUS_META,
  LEAD_STATE_META,
  NUMBER_HEALTH_META,
} from "./status-config";

type Size = "sm" | "md";

export function LeadStateBadge({ state, size, explain = true }: { state: LeadState; size?: Size; explain?: boolean }) {
  return <StatusBadge meta={LEAD_STATE_META[state]} size={size} explain={explain} />;
}

export function CallStatus({ state, size, label }: { state: CallState; size?: Size; label?: string }) {
  return <StatusBadge meta={CALL_STATE_META[state]} size={size} labelOverride={label} />;
}

export function DispositionBadge({ code, size }: { code: DispositionCode; size?: Size }) {
  return <StatusBadge meta={DISPOSITION_META[code]} size={size} />;
}

export function AgentStatus({ status, size }: { status: AgentStatusT; size?: Size }) {
  return <StatusBadge meta={AGENT_STATUS_META[status]} size={size} />;
}

export function NumberHealth({ health, size }: { health: NumberHealthT; size?: Size }) {
  return <StatusBadge meta={NUMBER_HEALTH_META[health]} size={size} explain />;
}

export function CampaignStatus({ status, size }: { status: CampaignStatusT; size?: Size }) {
  return <StatusBadge meta={CAMPAIGN_STATUS_META[status]} size={size} />;
}

export function CRMStatus({ state, size }: { state: CRMSyncState; size?: Size }) {
  return <StatusBadge meta={CRM_SYNC_META[state]} size={size} />;
}

export function ComplianceStatus({ status, size, label }: { status: ComplianceStatusT; size?: Size; label?: string }) {
  return <StatusBadge meta={COMPLIANCE_META[status]} size={size} labelOverride={label} />;
}

export function IntegrationStatus({ status, size }: { status: IntegrationStatusT; size?: Size }) {
  return <StatusBadge meta={INTEGRATION_STATUS_META[status]} size={size} />;
}

export { StatusBadge };
export * from "./status-config";
