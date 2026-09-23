import { z } from "zod";
import { DISPOSITION_CODES, LEAD_STATES, type CampaignDraft } from "@dialbrio/types";

/**
 * Campaign wizard schema. Mirrors `CampaignDraft` (packages/types) so the payload can be sent to
 * POST /v1/campaigns unchanged; moves to packages/validation when the API adopts it (Phase 2).
 */
export const campaignSchema = z
  .object({
    name: z.string().trim().min(3, "Use at least 3 characters").max(80, "Keep it under 80 characters"),
    description: z.string().max(280, "Keep it under 280 characters").optional(),
    dialStrategy: z.enum(["human", "ai"]),
    dialMode: z.enum(["preview", "power", "parallel", "progressive"]),
    /** Parallel lines (1–4). Only used when dialMode is "parallel"; the dialer session can lower it. */
    lines: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    /** Agent acknowledged TCPA requirements for parallel dialing. */
    parallelAck: z.boolean(),
    leadSource: z.object({
      type: z.enum(["ghl_tag", "ghl_pipeline", "ghl_smart_list", "csv"]),
      value: z.string().trim().min(1, "Choose where leads come from"),
    }),
    /** Dial a brand-new lead within ~10s of it arriving (form fill, ad lead, CRM stage change). */
    speedToLead: z.boolean(),
    leadStates: z.array(z.enum(LEAD_STATES)).min(1, "Select at least one lifecycle state"),
    queuePriority: z.number().int().min(1).max(10),
    callingWindow: z.object({
      days: z.array(z.number()).min(1, "Select at least one day"),
      start: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
      end: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
      timezone: z.string(),
    }),
    maxAttempts: z.number({ error: "Enter a number" }).int().min(1, "At least 1").max(20, "At most 20"),
    retryRules: z.array(
      z.object({
        disposition: z.enum(DISPOSITION_CODES),
        delayMinutes: z.number({ error: "Required" }).int().min(1, "Min 1"),
        maxAttempts: z.number({ error: "Required" }).int().min(1, "Min 1").max(20, "Max 20"),
      }),
    ),
    dispositions: z.array(z.enum(DISPOSITION_CODES)).min(3, "Keep at least 3 dispositions"),
    followUp: z.object({
      onNoAnswerSms: z.boolean(),
      /** One-click pre-recorded voicemail in the rep's own voice. */
      voicemailDrop: z.boolean(),
      smsTemplate: z.string().max(320, "SMS templates are limited to 320 characters (2 segments)").optional(),
      callbackReminderMinutes: z.number().int().min(0).max(120),
    }),
    callerIds: z.array(z.string()).min(1, "Select at least one caller ID"),
    numberRotation: z.enum(["round_robin", "local_presence", "fixed"]),
    agentIds: z.array(z.string()),
  })
  .superRefine((v, ctx) => {
    if (v.callingWindow.start >= v.callingWindow.end) ctx.addIssue({ code: "custom", path: ["callingWindow", "end"], message: "End must be after start" });
    if (!v.dispositions.includes("dnc")) ctx.addIssue({ code: "custom", path: ["dispositions"], message: "Do not call is required for compliance" });
    if (v.followUp.onNoAnswerSms && (v.followUp.smsTemplate ?? "").trim().length < 10)
      ctx.addIssue({ code: "custom", path: ["followUp", "smsTemplate"], message: "Write the SMS (at least 10 characters) or turn this off" });
    if (v.dialMode === "parallel" && !v.parallelAck)
      ctx.addIssue({ code: "custom", path: ["parallelAck"], message: "Confirm these leads have consent to be called with a dialer" });
    if (v.dialStrategy === "human" && v.agentIds.length === 0) ctx.addIssue({ code: "custom", path: ["agentIds"], message: "Assign at least one agent" });
    const seen = new Set<string>();
    v.retryRules.forEach((r, i) => {
      if (seen.has(r.disposition)) ctx.addIssue({ code: "custom", path: ["retryRules", i, "disposition"], message: "Duplicate disposition" });
      seen.add(r.disposition);
    });
  });

export type CampaignFormValues = z.infer<typeof campaignSchema>;

// Compile-time check that the form output is a valid API draft.
const _assignable = (v: CampaignFormValues): CampaignDraft => v;
void _assignable;

export const campaignDefaults: CampaignFormValues = {
  name: "",
  description: "",
  dialStrategy: "human",
  dialMode: "power",
  lines: 3,
  parallelAck: false,
  leadSource: { type: "ghl_tag", value: "" },
  speedToLead: true,
  leadStates: ["fresh"],
  queuePriority: 2,
  callingWindow: { days: [1, 2, 3, 4, 5], start: "09:00", end: "20:00", timezone: "contact" },
  maxAttempts: 6,
  retryRules: [
    { disposition: "no_answer", delayMinutes: 30, maxAttempts: 3 },
    { disposition: "busy", delayMinutes: 15, maxAttempts: 3 },
    { disposition: "voicemail", delayMinutes: 240, maxAttempts: 2 },
  ],
  dispositions: [...DISPOSITION_CODES],
  followUp: {
    onNoAnswerSms: true,
    voicemailDrop: true,
    smsTemplate: "Hi {{first_name}}, this is {{agent_name}} with Summit Solar — sorry we missed you. Is there a better time to talk?",
    callbackReminderMinutes: 10,
  },
  callerIds: [],
  numberRotation: "local_presence",
  agentIds: [],
};

export const LEAD_SOURCE_TYPES = [
  { value: "ghl_tag", label: "GoHighLevel tag", description: "Contacts with a tag are added automatically" },
  { value: "ghl_pipeline", label: "GoHighLevel pipeline stage", description: "Contacts entering a pipeline stage" },
  { value: "ghl_smart_list", label: "GoHighLevel smart list", description: "Contacts matching a saved smart list" },
  { value: "csv", label: "CSV upload", description: "One-time import (validated and de-duplicated)" },
] as const;

/** Example GHL values for the demo. Real options come from the CRM adapter in Phase 1. */
export const LEAD_SOURCE_OPTIONS: Record<CampaignFormValues["leadSource"]["type"], string[]> = {
  ghl_tag: ["web-lead", "fb-lead", "google-lead", "referral", "home-show", "reactivate"],
  ghl_pipeline: ["FB Leads › New", "Solar Sales › New lead", "Solar Sales › Contacted"],
  ghl_smart_list: ["No contact 14d+", "Homeowners · bill > $150", "Missed consults"],
  csv: ["Upload after launch (Phase 2)"],
};

export const DIAL_MODES = [
  { value: "preview", label: "Preview", spec: "1 line · agent clicks", description: "The rep reads the lead first, then dials. Use it for callbacks and high-value lists." },
  { value: "power", label: "Power", spec: "1 line · auto-next", description: "The next lead dials as soon as the last outcome is saved. The default for warm and fresh leads." },
  { value: "parallel", label: "Parallel", spec: "up to 4 lines · AMD < 1s", description: "Rings several leads at once and connects the rep to the first person who answers. Voicemails are dropped automatically." },
] as const;

export const ROTATIONS = [
  { value: "local_presence", label: "Local presence", description: "Use the number with the closest area code" },
  { value: "round_robin", label: "Round robin", description: "Spread volume evenly to protect number health" },
  { value: "fixed", label: "Fixed", description: "Always use the first selected number" },
] as const;

/** Labels for every dial mode, including modes no longer offered in the wizard. */
export const DIAL_MODE_LABEL: Record<CampaignFormValues["dialMode"], string> = {
  preview: "Preview",
  power: "Power",
  parallel: "Parallel",
  progressive: "Progressive",
};

/** PDF-style spec chip: mono, soft green. */
export const specChip = "inline-flex items-center rounded-[5px] bg-brand-soft px-2 py-0.5 font-mono text-[11px] text-brand-text";
