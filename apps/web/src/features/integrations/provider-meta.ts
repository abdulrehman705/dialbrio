import type { IntegrationCheck, IntegrationProvider, IntegrationStatus } from "@dialbrio/types";
import { CircleCheck, CircleDashed, CircleX, TriangleAlert, type LucideIcon } from "lucide-react";

/** Presentation metadata per provider. No official marks in the product UI. */
export const PROVIDER_META: Record<IntegrationProvider, { enables: string[]; connectMethod: string }> = {
  ghl: {
    connectMethod: "OAuth with your GoHighLevel agency or location account",
    enables: ["Lead ingestion via webhooks", "Outcome, note and tag sync back to the CRM", "Calendar availability for booking"],
  },
  twilio: {
    connectMethod: "Account SID and auth token, stored encrypted server-side",
    enables: ["Outbound and inbound calling", "SMS conversations", "Number management, A2P 10DLC and STIR/SHAKEN"],
  },
  llm: {
    connectMethod: "API key for your chosen provider, stored encrypted server-side",
    enables: ["Call summaries with confidence", "Intent detection and suggested dispositions", "QA scoring and coaching signals"],
  },
  stt: {
    connectMethod: "API key for your chosen speech-to-text provider",
    enables: ["Recording transcription", "Transcripts in AI QA and contact history", "Live transcription in the dialer (later)"],
  },
  storage: {
    connectMethod: "IAM role with scoped bucket access",
    enables: ["Encrypted call recording storage", "Exports and audit archives"],
  },
  stripe: {
    connectMethod: "Stripe Connect",
    enables: ["Subscription billing", "Usage-based charges for minutes, SMS and AI"],
  },
  sentry: {
    connectMethod: "Project DSN",
    enables: ["Error monitoring across web, API and workers"],
  },
};

export const CHECK_META: Record<IntegrationCheck["status"], { icon: LucideIcon; className: string; label: string }> = {
  ok: { icon: CircleCheck, className: "text-success-text", label: "Healthy" },
  warning: { icon: TriangleAlert, className: "text-warning-text", label: "Warning" },
  error: { icon: CircleX, className: "text-danger-text", label: "Error" },
  unknown: { icon: CircleDashed, className: "text-fg-muted", label: "Not configured" },
};

export function actionLabel(status: IntegrationStatus) {
  return status === "not_connected" ? "Connect" : status === "connected" ? "Manage" : "Fix";
}

export const CATEGORY_ORDER = ["CRM", "Telephony", "AI", "Billing", "Infrastructure", "Monitoring"] as const;

/** One line per category, shown beside its group in the directory. */
export const CATEGORY_COPY: Record<(typeof CATEGORY_ORDER)[number], string> = {
  CRM: "Where your contacts live. DialBrio reads new leads and writes every outcome back.",
  Telephony: "The carrier behind calls, texts and numbers.",
  AI: "Optional. Calling, SMS and CRM sync work without it.",
  Billing: "Your DialBrio subscription and metered usage.",
  Infrastructure: "Where recordings and exports are stored.",
  Monitoring: "Error reporting for the platform itself.",
};

/** Integrations on the roadmap. Not connectable yet; listed so admins can plan. */
export const PLANNED_INTEGRATIONS: { name: string; kind: string; native?: boolean }[] = [
  { name: "HubSpot", kind: "CRM", native: true },
  { name: "Salesforce", kind: "CRM", native: true },
  { name: "Zapier", kind: "Automation" },
  { name: "Webhooks + REST API", kind: "Developer" },
  { name: "Meta Lead Ads", kind: "Lead source" },
  { name: "ServiceTitan", kind: "Field service" },
  { name: "Housecall Pro", kind: "Field service" },
  { name: "Google Sheets", kind: "Lead source" },
  { name: "Slack", kind: "Alerts" },
];
