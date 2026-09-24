"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { formatPlanPrice, type Plan, type PriceBook } from "@dialbrio/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, InkPanel } from "./primitives";
import { PlannedMarker } from "@/components/app/planned-marker";

type Interval = "monthly" | "annual";

function PlanCard({ plan, plans, interval, annualDiscount }: { plan: Plan; plans: Plan[]; interval: Interval; annualDiscount: number }) {
  const parent = plans.find((p) => p.id === plan.inheritsFrom);
  const custom = plan.monthlyCents === null;
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={cn(
        "flex flex-col rounded-2xl border bg-surface p-6 text-fg",
        plan.popular ? "border-brand shadow-md ring-1 ring-brand" : "border-border shadow-sm",
      )}
    >
      <div className="min-h-[76px]">
        <div className="flex items-center justify-between gap-2">
          <h2 id={`plan-${plan.id}`} className="font-display text-[22px] font-bold tracking-[-0.02em]">
            {plan.name}
          </h2>
          {plan.popular && <span className="rounded-[5px] bg-brand-soft px-2 py-1 font-mono text-[10.5px] font-semibold tracking-[0.06em] text-brand-text uppercase">Most popular</span>}
        </div>
        <p className="mt-1 text-[14px] leading-5 text-fg-secondary">{plan.audience}</p>
      </div>
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-[48px] leading-none font-extrabold tracking-[-0.04em]">{formatPlanPrice(plan, interval === "annual", annualDiscount)}</span>
        {!custom && <span className="text-[14px] text-fg-muted">/mo</span>}
      </div>
      <p className="mt-2 h-5 text-[12.5px] text-fg-muted">
        {custom ? "Volume pricing on seats and minutes" : interval === "annual" ? `Billed annually · ${formatPlanPrice(plan, false, annualDiscount)}/mo monthly` : "Billed monthly · cancel anytime"}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-border pt-5 text-[14px] leading-5">
        {plan.includedSeats && (
          <li className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>
              {plan.includedSeats === 1 ? "1 seat · 1 workspace" : `${plan.includedSeats} seats included`}
              {plan.seatsNote && <span className="font-semibold"> ({plan.seatsNote})</span>}
            </span>
          </li>
        )}
        {parent && (
          <li className="flex gap-2.5 font-medium">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            Everything in {parent.name}, plus:
          </li>
        )}
        {plan.highlights
          .filter((h) => !(plan.id === "solo" && h.startsWith("1 seat")))
          .map((h, i, arr) => (
            <li key={h} className={cn("flex gap-2.5", i === arr.length - 1 && "text-fg-secondary")}>
              <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>
                {h}
                <PlannedMarker highlight={h} notes={plan.plannedNotes} />
              </span>
            </li>
          ))}
      </ul>

      <Button asChild variant={plan.popular ? "primary" : "secondary"} size="lg" className="mt-7 w-full">
        <Link href={`/waitlist?plan=${plan.id}`}>{plan.cta === "sales" ? "Talk to sales" : "Join waitlist"}</Link>
      </Button>
    </article>
  );
}

/** Ink pricing header with the monthly/annual toggle, and the plan cards overlapping onto paper. */
export function PricingPlans({ priceBook }: { priceBook: Pick<PriceBook, "plans" | "annualDiscount"> }) {
  const { plans, annualDiscount } = priceBook;
  const [interval, setInterval] = React.useState<Interval>("monthly");
  return (
    <section aria-label="Plans" className="bg-background">
      <div className="px-3 pt-3 sm:px-4 sm:pt-4">
        <InkPanel tone="paper" className="mx-auto max-w-[1400px] pt-16 pb-44 md:pt-20">
          <Container>
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="mt-4 max-w-[760px] font-display text-[42px] leading-[1.02] font-bold tracking-[-0.04em] md:text-[60px]">
              Every feature. Every plan. About 30% less.
            </h1>
            <p className="mt-5 max-w-[640px] text-[17px] leading-[1.6] text-fg-secondary">
              One flat platform fee, transparent usage rates and no per-feature upsells. Parallel dialing, AI coaching and white-label are
              included from day one, not gated behind an “Agency” tier.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div role="radiogroup" aria-label="Billing interval" className="light inline-flex rounded-full border border-border bg-surface p-1">
                {(
                  [
                    ["monthly", "Monthly", null],
                    ["annual", "Annual", `−${Math.round(annualDiscount * 100)}%`],
                  ] as const
                ).map(([value, label, note]) => {
                  const on = interval === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setInterval(value)}
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-[14px] font-medium transition-colors duration-(--duration-fast)",
                        on ? "bg-brand-solid text-brand-on" : "text-fg-secondary hover:text-fg",
                      )}
                    >
                      {label}
                      {note && <span className={cn("text-[12.5px]", on ? "opacity-80" : "text-fg-muted")}>{note}</span>}
                    </button>
                  );
                })}
              </div>
              <span className="sr-only" aria-live="polite">
                Showing {interval} prices
              </span>
            </div>
          </Container>
        </InkPanel>
      </div>
      <Container className="-mt-32">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} plans={plans} interval={interval} annualDiscount={annualDiscount} />
          ))}
        </div>
      </Container>
    </section>
  );
}
