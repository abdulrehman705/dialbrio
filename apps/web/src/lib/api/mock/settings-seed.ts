/** Seeded settings per section. DEMO ONLY — imported by lib/api/mock only. */
import type { SettingsSection, SettingsValues } from "@dialbrio/types";

export const settingsStore: Partial<Record<SettingsSection, SettingsValues>> = {
  general: { displayName: "Maya Chen", timezone: "America/Denver", dateFormat: "MMM d, yyyy", timeFormat: "12h" },
  organization: { name: "Northstar Growth", legalName: "Northstar Growth LLC", supportEmail: "support@northstargrowth.co" },
  dialer: {
    defaultDialMode: "power",
    wrapUpSeconds: 30,
    autoDialNext: false,
    voicemailDrop: true,
    localPresence: true,
    maxRingSeconds: 30,
    recordCalls: true,
  },
  compliance: {
    windowStart: "09:00",
    windowEnd: "20:00",
    windowTimezone: "contact",
    dncScrub: true,
    quietHours: true,
    requireConsentForSms: true,
    requireConsentForCalls: false,
  },
  notifications: {
    matrix: {
      crm_sync_failed: { inApp: true, email: true, sms: false },
      number_at_risk: { inApp: true, email: true, sms: true },
      queue_stale: { inApp: true, email: false, sms: false },
      callback_due: { inApp: true, email: false, sms: true },
      inbound_sms: { inApp: true, email: false, sms: false },
      usage_limit: { inApp: true, email: true, sms: false },
    },
  },
  ai: { provider: "none", callSummaries: false, intentDetection: false, qaScoring: false, suggestDispositions: false },
  billing: { plan: "Agency", minutesUsed: 41280, minutesIncluded: 48000, smsUsed: 9120, smsIncluded: 15000, seatsUsed: 8, seatsIncluded: 10, renewsOn: "Oct 14" },
  developer: {
    apiKeys: [
      { id: "key_1", name: "Reporting export", prefix: "db_live_7f3a", scopes: ["analytics:read"], createdAt: "2026-07-02", lastUsed: "2 hours ago" },
      { id: "key_2", name: "Website lead form", prefix: "db_live_c19e", scopes: ["contacts:write"], createdAt: "2026-05-18", lastUsed: "12 minutes ago" },
    ],
    webhooks: [
      { id: "wh_1", url: "https://hooks.northstargrowth.co/dialbrio/outcomes", events: ["disposition.recorded", "call.completed"], status: "healthy", secretLast4: "a91c" },
      { id: "wh_2", url: "https://ops.northstargrowth.co/alerts", events: ["number.health_changed", "crm.sync_failed"], status: "failing", secretLast4: "40fd" },
    ],
  },
};
