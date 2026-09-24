import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { COMPARISON, COMPARISON_FOOTNOTE, PRICING_FAQ, TRIAL, USAGE_RATES } from "@dialbrio/types";
import { Button } from "@/components/ui/button";
import { FinalCta } from "@/components/marketing/home";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Container, Section, SectionHeading, SpecChip } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/motion";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Solo $97, Team $247 with 5 seats, Agency $447 with 10 seats. Outbound calls 1.5¢/min, numbers $2/mo. Every feature on every plan.",
};

const th = "px-5 py-3 text-left font-mono text-[11.5px] font-medium tracking-[0.06em] text-fg-muted uppercase";

export default function PricingPage() {
  return (
    <>
      <PricingPlans />

      <Section aria-labelledby="usage-title">
        <Container>
          <SectionHeading
            id="usage-title"
            eyebrow="Usage rates"
            title="Telecom at cost-plus, not cost-plus-plus"
            description="Every plan uses the same metered rates. No markups by tier, no minimum commitments. Usage is billed monthly in arrears, and you can set hard spend caps per workspace and per client."
          />
          <Reveal>
          <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-[14px]">
              <caption className="sr-only">DialBrio usage rates compared with HotProspector</caption>
              <thead className="border-b border-border">
                <tr>
                  <th scope="col" className={th}>Item</th>
                  <th scope="col" className={th}>DialBrio</th>
                  <th scope="col" className={th}>HotProspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {USAGE_RATES.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="px-5 py-4 text-left font-normal text-fg">{r.label}</th>
                    <td className="px-5 py-4">
                      <span className="font-mono font-semibold text-fg">{r.rate}</span>
                      {r.savings && <SpecChip className="ml-2 py-0.5">{r.savings}</SpecChip>}
                    </td>
                    <td className="px-5 py-4 font-mono text-fg-muted">{r.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Reveal>
        </Container>
      </Section>

      <Section surface aria-labelledby="h2h-title">
        <Container>
          <SectionHeading id="h2h-title" eyebrow="Head to head" title="The same stack, priced honestly" description="Monthly cost for three real team shapes, using each vendor's published pricing." />
          <Reveal>
          <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[760px] text-[14px]">
              <caption className="sr-only">Monthly cost scenarios: DialBrio, HotProspector and Kixie</caption>
              <thead className="border-b border-border">
                <tr>
                  <th scope="col" className={th}>Monthly cost scenario</th>
                  <th scope="col" className={th}>DialBrio</th>
                  <th scope="col" className={th}>HotProspector</th>
                  <th scope="col" className={th}>Kixie (per-seat)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON.map((row) => (
                  <tr key={row.scenario}>
                    <th scope="row" className="px-5 py-4 text-left font-medium text-fg">{row.scenario}</th>
                    <td className={row.emphasis ? "px-5 py-4 font-display text-[18px] font-bold tracking-[-0.02em] text-brand-text" : "px-5 py-4 font-medium text-brand-text"}>{row.us}</td>
                    <td className="px-5 py-4 text-fg-secondary">{row.hotProspector}</td>
                    <td className="px-5 py-4 text-fg-secondary">{row.kixie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-border px-5 py-4 text-[12.5px] leading-5 text-fg-muted">{COMPARISON_FOOTNOTE}</p>
          </div>
          </Reveal>

          <Reveal>
          <div className="mt-12 flex flex-col gap-5 rounded-xl border border-warning bg-warning-soft p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-[24px] leading-tight font-bold tracking-[-0.025em] text-fg">
                Try it on your own leads, free for {TRIAL.days} days.
              </h2>
              <p className="mt-2 max-w-[620px] text-[15px] leading-6 text-fg-secondary">
                Full platform, {TRIAL.freeMinutes} free minutes, no credit card. Month-to-month after that; cancel anytime and export everything.
              </p>
            </div>
            <Button asChild variant="secondary" size="lg" className="shrink-0">
              <Link href="/get-started">Start free trial</Link>
            </Button>
          </div>
          </Reveal>
        </Container>
      </Section>

      <Section aria-labelledby="faq-title">
        <Container className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Pricing questions, answered" />
          <Reveal delay={0.08} className="flex flex-col gap-3">
            {PRICING_FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-surface open:shadow-sm">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15.5px] font-semibold text-fg [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-fg-muted transition-transform duration-(--duration-base) group-open:rotate-180" aria-hidden />
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-[1.65] text-fg-secondary">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </Container>
      </Section>

      <FinalCta />
      <p className="bg-background px-4 pb-10 text-center text-xs text-fg-muted">
        Pricing is the proposed launch price book, Sept 2026. Competitor rates from public pricing pages.
      </p>
    </>
  );
}
