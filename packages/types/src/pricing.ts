/**
 * DialBrio price book — proposed launch pricing (Sept 2026).
 * Single source for the marketing pricing page and in-app billing. Amounts in US cents.
 */

export const PLAN_IDS = ["solo", "team", "agency", "enterprise"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface Plan {
  id: PlanId;
  name: string;
  audience: string;
  /** Monthly price in cents; null = custom. */
  monthlyCents: number | null;
  includedSeats: number | null;
  /** Competitor comparison shown next to seats (published pricing, Sept 2026). */
  seatsNote?: string;
  highlights: string[];
  inheritsFrom?: PlanId;
  cta: "trial" | "sales";
  popular?: boolean;
  includedAiMinutes?: number;
  /** Highlights that describe roadmap features, mapped to the tooltip explaining when they ship. */
  plannedNotes?: Record<string, string>;
}

export const ANNUAL_DISCOUNT = 0.2;
export const TRIAL = { days: 14, freeMinutes: 500, cardRequired: false } as const;

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    audience: "One closer or a founder doing their own outreach.",
    monthlyCents: 9700,
    includedSeats: 1,
    highlights: [
      "1 seat · 1 workspace",
      "Power dialer + 4-line parallel mode",
      "Local presence & number rotation",
      "AI call transcription & scoring",
      "GoHighLevel / HubSpot native sync",
      "Community + email support",
    ],
    cta: "trial",
  },
  {
    id: "team",
    name: "Team",
    audience: "Sales teams and in-house SDR pods of 2–10.",
    monthlyCents: 24700,
    includedSeats: 5,
    seatsNote: "vs. 3 at HotProspector",
    inheritsFrom: "solo",
    highlights: [
      "Speed-to-lead auto-dial (<10s)",
      "AI coaching & objection tracking",
      "Voicemail drop + SMS/email sequences",
      "Team leaderboards & live call monitor",
      "Priority chat support",
    ],
    cta: "trial",
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    audience: "Agencies running calling for multiple clients.",
    monthlyCents: 44700,
    includedSeats: 10,
    seatsNote: "vs. 5 at HotProspector",
    inheritsFrom: "team",
    highlights: [
      "Unlimited client sub-accounts",
      "White-label portal on your domain",
      "Client-level reporting & margin billing",
      "AI voice + SMS agents (1,000 AI min/mo)",
      "48-hr white-glove migration",
    ],
    cta: "trial",
    includedAiMinutes: 1000,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    audience: "25+ seats, call centers, and platform resellers.",
    monthlyCents: null,
    includedSeats: null,
    highlights: [
      "Volume seat & minute pricing",
      "SSO, audit logs, custom retention",
      "Dedicated success manager",
      "99.99% uptime SLA",
      "API & webhook rate-limit raises",
      "Security review & DPA support",
    ],
    cta: "sales",
  },
];

export type UsageItemId = "outbound_min" | "inbound_min" | "sms_segment" | "local_number" | "extra_seat" | "ai_min";

export interface UsageRate {
  id: UsageItemId;
  label: string;
  /** Display string for our rate. */
  rate: string;
  /** Unit price in hundredths of a cent (so 1.5¢ = 150). */
  unitMilliCents: number;
  unit: string;
  competitor: string;
  savings?: string;
}

export const USAGE_RATES: UsageRate[] = [
  { id: "outbound_min", label: "Outbound calls (US/CA)", rate: "1.5¢ / min", unitMilliCents: 150, unit: "min", competitor: "2¢ / min", savings: "−25%" },
  { id: "inbound_min", label: "Inbound calls", rate: "1¢ / min", unitMilliCents: 100, unit: "min", competitor: "2¢ / min" },
  { id: "sms_segment", label: "SMS segments", rate: "1.2¢ each", unitMilliCents: 120, unit: "segment", competitor: "n/a listed" },
  { id: "local_number", label: "Local phone numbers", rate: "$2 / number / mo", unitMilliCents: 20000, unit: "number", competitor: "$3 / number / mo", savings: "−33%" },
  { id: "extra_seat", label: "Extra agent seats", rate: "$59 / mo · 5-pack $225", unitMilliCents: 590000, unit: "seat", competitor: "$75 / mo · 5-pack $250" },
  { id: "ai_min", label: "AI voice-agent minutes", rate: "9¢ / min after included", unitMilliCents: 900, unit: "min", competitor: "not published" },
];

export const SEAT_FIVE_PACK_CENTS = 22500;

/** `first`/`second` are the two competitor columns; their labels live on the PriceBook. */
export interface ComparisonRow { scenario: string; us: string; first: string; second: string; emphasis?: boolean }

export const COMPARISON: ComparisonRow[] = [
  { scenario: "Solo rep, 1 number, 3k min", us: "$146", first: "$200", second: "~$115 + $50 parallel add-on", emphasis: true },
  { scenario: "5-rep team, 10 numbers, 20k min", us: "$567", first: "$797*", second: "$500+ before add-ons", emphasis: true },
  { scenario: "Agency: 10 reps, 15 clients, 60k min", us: "$1,377", first: "$1,902*", second: "Not multi-tenant", emphasis: true },
  { scenario: "Parallel dialing", us: "Included (4 lines)", first: "Included (3 lines)", second: "+$50/user/mo" },
  { scenario: "White-label + sub-accounts", us: "Included on Agency", first: "Included on Agency", second: "Not offered" },
  { scenario: "Free trial", us: "14 days, self-serve", first: "Demo call required", second: "7 days" },
];

export const COMPARISON_FOOTNOTE =
  "*HotProspector: Business $297 needs +2 seats ($150) for a 5-rep team; Agency $497 needs +5 seats ($250); plus 2¢/min and $3/number. Competitor prices as published Sept 2026.";

export const PRICING_FAQ: { q: string; a: string }[] = [
  { q: "Are there setup fees or contracts?", a: "No. Every plan is month-to-month with no setup fee. Agency and Enterprise plans include free white-glove migration — we port your numbers, import your lists, and rebuild your workflows within 48 hours." },
  { q: "What happens if I go over my included seats?", a: "Extra seats are $59/month each, or $225/month for a 5-pack ($45/seat). Seats are prorated daily, so adding a rep mid-month only costs you the days they're active." },
  { q: "How does usage billing work?", a: "Calls, SMS, numbers, and AI-agent minutes are metered and billed at the end of each month at the flat rates above — the same rates on every plan. You can set hard spend caps per workspace and per client sub-account." },
  { q: "Can I resell DialBrio to my clients?", a: "Yes — that's the point of the Agency plan. White-label the portal on your own domain, set your own client pricing on minutes and seats, and keep the margin. Client billing tools are built in." },
  { q: "Do you charge more for TCPA compliance tools?", a: "Never. DNC scrubbing, consent tracking, calling-hours enforcement, and spam-label monitoring are included on every plan, including the trial. Compliance shouldn't be an upsell." },
];

export function formatPlanPrice(plan: Plan, annual: boolean, annualDiscount: number = ANNUAL_DISCOUNT): string {
  if (plan.monthlyCents === null) return "Custom";
  const cents = annual ? Math.round(plan.monthlyCents * (1 - annualDiscount)) : plan.monthlyCents;
  return `$${Math.round(cents / 100)}`;
}

/**
 * Plan highlights that describe roadmap features rather than shipped ones.
 * Pricing and billing UIs render a "planned" marker next to these so the price book stays honest.
 */
const PLANNED_HIGHLIGHTS: [RegExp, string][] = [
  [/HubSpot/, "HubSpot sync is planned; GoHighLevel is native today"],
  [/AI call transcription|AI coaching/, "AI transcription, scoring and coaching ship in the AI release (Phase 5)"],
  [/AI voice/, "AI voice and SMS agents ship in Phase 6"],
  [/email sequences/, "Email sequences arrive in Phase 4; SMS works today"],
  [/live call monitor/, "Live listen, whisper and barge arrive with Twilio voice (Phase 3)"],
  [/White-label|margin billing/, "White-label and client rebilling ship in Phase 7"],
  [/SSO/, "SSO is planned for Enterprise"],
];

export function plannedStatus(highlight: string): string | null {
  return PLANNED_HIGHLIGHTS.find(([re]) => re.test(highlight))?.[1] ?? null;
}

/**
 * Everything the pricing page and billing need, in one object. The web app loads it from Sanity
 * (studio/: plan, usageRate, comparisonRow, faq, pricingPage) and falls back, section by section,
 * to DEFAULT_PRICE_BOOK when a section is empty or Sanity is unreachable.
 */
export interface PriceBook {
  plans: Plan[];
  usageRates: UsageRate[];
  comparison: ComparisonRow[];
  competitorLabels: { first: string; second: string };
  comparisonFootnote: string;
  faq: { q: string; a: string }[];
  trial: { days: number; freeMinutes: number; cardRequired: boolean };
  /** 0..1, e.g. 0.2 for 20% off annual. */
  annualDiscount: number;
  /** Where the data came from; "code" means the Sanity fetch was empty or failed. */
  source: "sanity" | "code" | "mixed";
}

export const DEFAULT_PRICE_BOOK: PriceBook = {
  plans: PLANS,
  usageRates: USAGE_RATES,
  comparison: COMPARISON,
  competitorLabels: { first: "HotProspector", second: "Kixie (per-seat)" },
  comparisonFootnote: COMPARISON_FOOTNOTE,
  faq: PRICING_FAQ,
  trial: { days: TRIAL.days, freeMinutes: TRIAL.freeMinutes, cardRequired: TRIAL.cardRequired },
  annualDiscount: ANNUAL_DISCOUNT,
  source: "code",
};

export function trialLine(trial: PriceBook["trial"]): string {
  return `${trial.days}-day free trial · ${trial.freeMinutes.toLocaleString("en-US")} free minutes${trial.cardRequired ? "" : " · no credit card"}`;
}
