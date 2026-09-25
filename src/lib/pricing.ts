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
  /** Optional short note after the seat count. */
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
    inheritsFrom: "solo",
    highlights: [
      "Speed-to-lead auto-dial (<10s)",
      "AI coaching & objection tracking",
      "SMS/email sequences",
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
}

export const USAGE_RATES: UsageRate[] = [
  { id: "outbound_min", label: "Outbound calls (US/CA)", rate: "1.5¢ / min", unitMilliCents: 150, unit: "min" },
  { id: "inbound_min", label: "Inbound calls", rate: "1¢ / min", unitMilliCents: 100, unit: "min" },
  { id: "sms_segment", label: "SMS segments", rate: "1.2¢ each", unitMilliCents: 120, unit: "segment" },
  { id: "local_number", label: "Local phone numbers", rate: "$2 / number / mo", unitMilliCents: 20000, unit: "number" },
  { id: "extra_seat", label: "Extra agent seats", rate: "$59 / mo · 5-pack $225", unitMilliCents: 590000, unit: "seat" },
  { id: "ai_min", label: "AI voice-agent minutes", rate: "9¢ / min after included", unitMilliCents: 900, unit: "min" },
];

/** `first`/`second` are the two competitor columns; their labels live on the PriceBook. */
/** A competitor column: only figures the vendor publishes on its own pricing page. */
export interface Competitor { name: string; sourceUrl: string }

/** `values` is keyed by competitor name; missing means "Not published". */
export interface ComparisonRow { scenario: string; us: string; values: Record<string, string> }

export const COMPARISON_CHECKED_ON = "2026-09-25";

export const COMPETITORS: Competitor[] = [
  { name: "Aloware", sourceUrl: "https://aloware.com/pricing" },
  { name: "Kixie", sourceUrl: "https://www.kixie.com/pricing" },
  { name: "Five9", sourceUrl: "https://www.five9.com/pricing" },
  { name: "Wavv", sourceUrl: "https://www.wavv.com/plans" },
];

const NP = "Not published";

export const COMPARISON: ComparisonRow[] = [
  { scenario: "Price with power dialing", us: "$97/mo for 1 seat · $247/mo for 5", values: { Aloware: "$70/user/mo (uPro)", Kixie: "Quote only", Five9: "$119/user/mo (Digital)", Wavv: NP } },
  { scenario: "Minimum seats", us: "1", values: { Aloware: "5 on power-dialer plans", Kixie: NP, Five9: "50", Wavv: NP } },
  { scenario: "Parallel dialing", us: "Included, up to 4 lines", values: { Aloware: NP, Kixie: "Up to 4 lines (Multi-Line plan)", Five9: "Predictive dialing included", Wavv: NP } },
  { scenario: "Local phone numbers", us: "$2 / number / mo", values: { Aloware: "$4–6 / number / mo", Kixie: NP, Five9: NP, Wavv: NP } },
  { scenario: "Free trial", us: "14 days", values: { Aloware: "7 days", Kixie: "7 days, no card", Five9: NP, Wavv: "7 days" } },
  { scenario: "White-label + client sub-accounts", us: "Included on Agency", values: { Aloware: NP, Kixie: NP, Five9: NP, Wavv: NP } },
];

export const COMPARISON_FOOTNOTE =
  "Competitor details are taken only from each vendor's public pricing page. \"Not published\" means the vendor doesn't list it publicly. Aloware includes agent calling minutes in its per-user price. Prices change; check each vendor's site before deciding.";

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
  competitors: Competitor[];
  /** ISO date the competitor figures were last checked. */
  comparisonCheckedOn: string;
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
  competitors: COMPETITORS,
  comparisonCheckedOn: COMPARISON_CHECKED_ON,
  comparisonFootnote: COMPARISON_FOOTNOTE,
  faq: PRICING_FAQ,
  trial: { days: TRIAL.days, freeMinutes: TRIAL.freeMinutes, cardRequired: TRIAL.cardRequired },
  annualDiscount: ANNUAL_DISCOUNT,
  source: "code",
};

export function trialLine(trial: PriceBook["trial"]): string {
  return `${trial.days}-day free trial · ${trial.freeMinutes.toLocaleString("en-US")} free minutes${trial.cardRequired ? "" : " · no credit card"}`;
}
