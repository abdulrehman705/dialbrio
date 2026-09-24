import "server-only";
import { cache } from "react";
import {
  DEFAULT_PRICE_BOOK,
  PLAN_IDS,
  type Plan,
  type PlanId,
  type PriceBook,
  type UsageItemId,
  type UsageRate,
} from "@dialbrio/types";
import { isSanityConfigured } from "./env";
import { sanityFetch } from "./lib/live";
import { PRICE_BOOK_QUERY } from "./queries";
import type { PRICE_BOOK_QUERY_RESULT } from "./sanity.types";

const USAGE_IDS: UsageItemId[] = ["outbound_min", "inbound_min", "sms_segment", "local_number", "extra_seat", "ai_min"];

type Raw = PRICE_BOOK_QUERY_RESULT;

const isPlanId = (v: unknown): v is PlanId => typeof v === "string" && (PLAN_IDS as readonly string[]).includes(v);
const isUsageId = (v: unknown): v is UsageItemId => typeof v === "string" && (USAGE_IDS as string[]).includes(v);

function mapPlans(raw: Raw["plans"]): Plan[] {
  return raw.flatMap((p) => {
    if (!isPlanId(p.planKey) || !p.name) return [];
    const highlights = (p.highlights ?? []).filter((h) => h.text);
    const plannedNotes = Object.fromEntries(
      highlights.filter((h) => h.availability === "planned").map((h) => [h.text!, h.plannedNote || "Planned"]),
    );
    return [{
      id: p.planKey,
      name: p.name,
      audience: p.audience ?? "",
      monthlyCents: typeof p.monthlyPrice === "number" ? Math.round(p.monthlyPrice * 100) : null,
      includedSeats: typeof p.includedSeats === "number" ? p.includedSeats : null,
      seatsNote: p.seatsNote ?? undefined,
      highlights: highlights.map((h) => h.text!),
      plannedNotes,
      inheritsFrom: isPlanId(p.inheritsFrom) ? p.inheritsFrom : undefined,
      cta: p.cta === "sales" ? "sales" : "trial",
      popular: p.badge === "popular",
      includedAiMinutes: p.includedAiMinutes ?? undefined,
    } satisfies Plan];
  });
}

function mapUsage(raw: Raw["usageRates"]): UsageRate[] {
  return raw.flatMap((r) =>
    isUsageId(r.itemKey) && r.label && typeof r.unitPriceCents === "number" && r.displayRate
      ? [{
          id: r.itemKey,
          label: r.label,
          rate: r.displayRate,
          unitMilliCents: Math.round(r.unitPriceCents * 100),
          unit: r.unit ?? "",
          competitor: r.competitorRate ?? "",
          savings: r.savingsLabel ?? undefined,
        }]
      : [],
  );
}

/**
 * The price book for this request. Reads Sanity through the Live Content API; each section falls back
 * to the code price book when it's empty, and the whole book falls back if Sanity is unreachable, so
 * pricing and billing never render blank.
 */
export const getPriceBook = cache(async (): Promise<PriceBook> => {
  if (!isSanityConfigured) return DEFAULT_PRICE_BOOK;
  try {
    const { data } = await sanityFetch({ query: PRICE_BOOK_QUERY, stega: false });
    const raw: Raw = data;
    const d = DEFAULT_PRICE_BOOK;
    const plans = mapPlans(raw.plans ?? []);
    const usageRates = mapUsage(raw.usageRates ?? []);
    const comparison = (raw.comparison ?? []).flatMap((c) =>
      c.scenario && c.ours ? [{ scenario: c.scenario, us: c.ours, first: c.firstCompetitor ?? "", second: c.secondCompetitor ?? "", emphasis: c.kind === "cost" }] : [],
    );
    const faq = (raw.page?.faq ?? []).flatMap((f) => (f?.question && f.answer ? [{ q: f.question, a: f.answer }] : []));
    const t = raw.page?.trial;

    const sections = {
      plans: plans.length ? plans : null,
      usageRates: usageRates.length ? usageRates : null,
      comparison: comparison.length ? comparison : null,
      faq: faq.length ? faq : null,
    };
    const fromSanity = Object.values(sections).filter(Boolean).length;

    return {
      plans: sections.plans ?? d.plans,
      usageRates: sections.usageRates ?? d.usageRates,
      comparison: sections.comparison ?? d.comparison,
      faq: sections.faq ?? d.faq,
      competitorLabels: {
        first: raw.page?.competitorLabels?.first || d.competitorLabels.first,
        second: raw.page?.competitorLabels?.second || d.competitorLabels.second,
      },
      comparisonFootnote: raw.page?.comparisonFootnote || d.comparisonFootnote,
      trial: {
        days: t?.days ?? d.trial.days,
        freeMinutes: t?.freeMinutes ?? d.trial.freeMinutes,
        cardRequired: t?.cardRequired ?? d.trial.cardRequired,
      },
      annualDiscount: typeof raw.page?.annualDiscountPercent === "number" ? raw.page.annualDiscountPercent / 100 : d.annualDiscount,
      source: fromSanity === 4 ? "sanity" : fromSanity === 0 ? "code" : "mixed",
    };
  } catch (err) {
    console.error("[sanity] price book fetch failed; using code price book", err);
    return DEFAULT_PRICE_BOOK;
  }
});
