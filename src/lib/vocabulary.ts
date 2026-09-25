/**
 * Product vocabulary the marketing site illustrates (lead lifecycle, call dispositions).
 * The product repo owns the full domain model; keep these in step with it when the wording changes.
 */
export const LEAD_STATES = ["fresh", "warm", "aged", "zombie"] as const;
export type LeadState = (typeof LEAD_STATES)[number];

export const DISPOSITION_CODES = [
  "interested", "appointment", "callback", "no_answer", "busy", "voicemail", "not_interested", "wrong_number", "dnc",
] as const;
export type DispositionCode = (typeof DISPOSITION_CODES)[number];
