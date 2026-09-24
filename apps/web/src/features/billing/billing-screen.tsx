"use client";

import * as React from "react";
import { PLANS, TRIAL, USAGE_RATES, ANNUAL_DISCOUNT, type BillingOverview, type BillingUsageLine } from "@dialbrio/types";
import { Check, CreditCard, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { useBilling } from "@/lib/queries";
import { cn, formatNumber } from "@/lib/utils";
import { money, moneyWhole, periodInfo } from "./format";
import { PlanDialog } from "./plan-dialog";
import { PlannedMarker } from "@/components/app/planned-marker";
import { CountOnce } from "@/components/charts/kpi-strip";

const stripeLater = (what: string) =>
  toast(`${what} opens the Stripe billing portal`, { description: "The portal connects in Phase 7. Nothing was changed." });

function unitLabel(line: BillingUsageLine) {
  const rate = USAGE_RATES.find((r) => r.id === line.id);
  const unit = rate?.unit ?? "";
  const plural = line.quantity === 1 ? unit : unit === "min" ? "min" : `${unit}s`;
  return `${formatNumber(line.quantity)} ${plural}`;
}

/* ── Estimated invoice ledger ─────────────────────────────────────────── */
function InvoiceLedger({ b }: { b: BillingOverview }) {
  const plan = PLANS.find((p) => p.id === b.planId)!;
  const period = periodInfo(b.periodStart, b.periodEnd);
  return (
    <Card className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5">
        <div>
          <p className="text-[13px] font-medium text-fg-secondary">Estimated invoice so far</p>
          <p className="mt-1 font-display text-[40px] leading-none font-bold tracking-[-0.035em] text-fg">
            <CountOnce id="billing:estimated-total" text={money(b.estimatedTotalCents)} />
          </p>
        </div>
        <div className="min-w-48 flex-1 sm:max-w-64">
          <div className="flex justify-between text-xs text-fg-muted">
            <span className="font-mono">{period.label}</span>
            <span>{period.daysLeft} days left</span>
          </div>
          <Progress className="mt-2" label="Billing period elapsed" value={period.pct} tone="brand" />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-[13px] sm:min-w-[520px]">
          <caption className="sr-only">Estimated invoice line items</caption>
          <thead>
            <tr className="border-y border-border text-left text-xs text-fg-muted">
              <th scope="col" className="py-2 pl-5 font-medium">Item</th>
              <th scope="col" className="py-2 font-medium">Quantity</th>
              <th scope="col" className="py-2 font-medium max-sm:hidden">Rate</th>
              <th scope="col" className="py-2 pr-5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="py-2.5 pl-5 text-fg">{plan.name} plan</td>
              <td className="py-2.5 text-fg-secondary">{b.seats.included} seats included</td>
              <td className="py-2.5 font-mono text-xs text-fg-muted max-sm:hidden">flat</td>
              <td className="py-2.5 pr-5 text-right font-mono text-fg">{money(b.platformCents)}</td>
            </tr>
            <tr>
              <td className="py-2.5 pl-5 text-fg">Extra seats</td>
              <td className="py-2.5 text-fg-secondary">
                {b.seats.extra} of {b.seats.used} in use
              </td>
              <td className="py-2.5 font-mono text-xs text-fg-muted max-sm:hidden">$59 / seat</td>
              <td className="py-2.5 pr-5 text-right font-mono text-fg">{money(b.seatsCents)}</td>
            </tr>
            {b.usage.map((u) => (
              <tr key={u.id}>
                <td className="py-2.5 pl-5 text-fg">{u.label}</td>
                <td className="py-2.5 text-fg-secondary">
                  {unitLabel(u)}
                  {u.included > 0 && <span className="text-fg-muted"> · {formatNumber(u.included)} included</span>}
                  <span className="block font-mono text-xs text-fg-muted sm:hidden">{u.rate}</span>
                </td>
                <td className="py-2.5 font-mono text-xs text-fg-muted max-sm:hidden">{u.rate}</td>
                <td className={cn("py-2.5 pr-5 text-right font-mono", u.amountCents === 0 ? "text-fg-muted" : "text-fg")}>{money(u.amountCents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border-strong">
              <td colSpan={2} className="py-3 pl-5 font-semibold text-fg">
                Total so far
              </td>
              <td className="max-sm:hidden" />
              <td className="py-3 pr-5 text-right font-mono font-semibold text-fg">{money(b.estimatedTotalCents)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-auto border-t border-border px-5 py-3 text-xs leading-5 text-fg-muted">
        Usage is billed monthly in arrears at the same rates on every plan. This invoice closes on {period.closes}; seats added mid-period are
        prorated by the day.
      </p>
    </Card>
  );
}

/* ── Plan panel (dark ink) ────────────────────────────────────────────── */
function PlanPanel({ b, onChangePlan }: { b: BillingOverview; onChangePlan: () => void }) {
  const plan = PLANS.find((p) => p.id === b.planId)!;
  const annualMonthly = plan.monthlyCents ? Math.round(plan.monthlyCents * (1 - ANNUAL_DISCOUNT)) : null;
  const inherits = plan.inheritsFrom ? PLANS.find((p) => p.id === plan.inheritsFrom)?.name : null;
  return (
    <div className="dark flex min-w-0 flex-col gap-5 rounded-lg border border-border bg-background p-5 text-fg">
      <div>
        <p className="eyebrow">Your plan</p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[28px] leading-none font-bold tracking-[-0.03em]">{plan.name}</h2>
          {plan.monthlyCents !== null && (
            <p className="font-mono text-sm text-fg-secondary">
              {moneyWhole(plan.monthlyCents)}
              <span className="text-fg-muted">/mo</span>
            </p>
          )}
        </div>
        <p className="mt-1.5 text-[13px] text-fg-secondary">{plan.audience}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
        <div>
          <dt className="text-fg-muted">Seats</dt>
          <dd className="mt-0.5 font-mono text-fg">
            {b.seats.included} incl. <span className="text-fg-muted">+ {b.seats.extra} extra</span>
          </dd>
        </div>
        <div>
          <dt className="text-fg-muted">Client sub-accounts</dt>
          <dd className="mt-0.5 font-mono text-fg">
            {b.subAccounts} <span className="text-fg-muted">/ unlimited</span>
          </dd>
        </div>
      </dl>
      <div className="border-t border-border pt-4">
        <p className="text-[13px] text-fg-muted">{inherits ? `Everything in ${inherits}, plus` : "Includes"}</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-fg-secondary">
          {plan.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
              <span>
                {h}
                <PlannedMarker highlight={h} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {annualMonthly !== null && b.interval === "monthly" && (
        <p className="border-t border-border pt-4 text-[13px] leading-5 text-fg-secondary">
          Annual billing brings {plan.name} to <span className="font-mono text-fg">{moneyWhole(annualMonthly)}/mo</span>, saving{" "}
          <span className="font-mono text-fg">{moneyWhole((plan.monthlyCents! - annualMonthly) * 12)}</span> a year.
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={onChangePlan}>
          Compare plans
        </Button>
        <Button variant="ghost" size="sm" onClick={() => stripeLater("Adding seats")}>
          Add seats
        </Button>
      </div>
    </div>
  );
}

/* ── Usage meters ─────────────────────────────────────────────────────── */
function UsageStrip({ b }: { b: BillingOverview }) {
  const get = (id: BillingUsageLine["id"]) => b.usage.find((u) => u.id === id);
  const out = get("outbound_min");
  const inbound = get("inbound_min");
  const sms = get("sms_segment");
  const nums = get("local_number");
  const ai = get("ai_min");
  const cells = [
    { label: "Call minutes", value: formatNumber((out?.quantity ?? 0) + (inbound?.quantity ?? 0)), sub: `${formatNumber(out?.quantity ?? 0)} out · ${formatNumber(inbound?.quantity ?? 0)} in` },
    { label: "SMS segments", value: formatNumber(sms?.quantity ?? 0), sub: sms?.rate ?? "" },
    { label: "Phone numbers", value: formatNumber(nums?.quantity ?? 0), sub: nums?.rate ?? "" },
  ];
  const aiPct = ai && ai.included ? (ai.quantity / ai.included) * 100 : 0;
  return (
    <section aria-labelledby="usage-heading" className="flex flex-col gap-3">
      <h2 id="usage-heading" className="font-display text-lg font-bold tracking-[-0.02em] text-fg">
        Usage this period
      </h2>
      <div className="grid overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-2 lg:grid-cols-4">
        {cells.map((c, i) => (
          <div key={c.label} className={cn("flex flex-col gap-1 p-4", i > 0 && "border-t border-border sm:border-t-0", i % 2 === 1 && "sm:border-l", i === 2 && "lg:border-l sm:border-t lg:border-t-0")}>
            <span className="text-[13px] text-fg-muted">{c.label}</span>
            <span className="font-display text-2xl font-bold tracking-[-0.02em] text-fg">{c.value}</span>
            <span className="font-mono text-xs text-fg-muted">{c.sub}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1 border-t border-border p-4 sm:border-l lg:border-t-0">
          <span className="text-[13px] text-fg-muted">AI agent minutes</span>
          <span className="font-display text-2xl font-bold tracking-[-0.02em] text-fg">
            {formatNumber(ai?.quantity ?? 0)}
            <span className="ml-1 font-sans text-sm font-normal text-fg-muted">/ {formatNumber(ai?.included ?? 0)} incl.</span>
          </span>
          <Progress className="mt-1.5" label="AI agent minutes used of included" value={aiPct} tone={aiPct >= 90 ? "warning" : "ai"} />
          <span className="font-mono text-xs text-fg-muted">then 9¢ / min</span>
        </div>
      </div>
    </section>
  );
}

/* ── Client rebilling ─────────────────────────────────────────────────── */
function Rebilling({ b }: { b: BillingOverview }) {
  const rows = b.bySubAccount;
  const totals = rows.reduce(
    (t, r) => ({ minutes: t.minutes + r.minutes, sms: t.sms + r.sms, numbers: t.numbers + r.numbers, cost: t.cost + r.costCents, billed: t.billed + r.rebilledCents }),
    { minutes: 0, sms: 0, numbers: 0, cost: 0, billed: 0 },
  );
  const margin = (cost: number, billed: number) => (billed ? (billed - cost) / billed : 0);
  if (rows.length === 0)
    return <EmptyState icon={FileText} title="No client usage yet" description="Usage per client sub-account appears here once calls go out." />;

  return (
    <section aria-labelledby="rebill-heading" className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <div>
        <p className="eyebrow">Agency rebilling</p>
        <h2 id="rebill-heading" className="mt-2 font-display text-lg font-bold tracking-[-0.02em] text-fg">
          What each client costs you, and what you bill them
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-fg-muted">
          Usage is metered per sub-account. You set client rates; the spread is yours. Generated client invoices arrive with white-label in
          Phase 7.
        </p>
      </div>
      <Card className="min-w-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-[13px]">
            <caption className="sr-only">Usage cost and rebilled amount by client sub-account</caption>
            <thead>
              <tr className="border-b border-border bg-surface-sunken text-left text-xs text-fg-muted">
                <th scope="col" className="py-2 pl-4 font-medium">Client</th>
                <th scope="col" className="py-2 text-right font-medium">Minutes</th>
                <th scope="col" className="py-2 text-right font-medium">SMS</th>
                <th scope="col" className="py-2 text-right font-medium">Numbers</th>
                <th scope="col" className="py-2 text-right font-medium">Your cost</th>
                <th scope="col" className="py-2 text-right font-medium">Billed</th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.subAccountId}>
                  <td className="py-2.5 pl-4 font-medium text-fg">{r.name}</td>
                  <td className="py-2.5 text-right font-mono text-fg-secondary">{formatNumber(r.minutes)}</td>
                  <td className="py-2.5 text-right font-mono text-fg-secondary">{formatNumber(r.sms)}</td>
                  <td className="py-2.5 text-right font-mono text-fg-secondary">{r.numbers}</td>
                  <td className="py-2.5 text-right font-mono text-fg-secondary">{money(r.costCents)}</td>
                  <td className="py-2.5 text-right font-mono text-fg">{money(r.rebilledCents)}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-success-text">
                    {money(r.rebilledCents - r.costCents)} <span className="text-fg-muted">{Math.round(margin(r.costCents, r.rebilledCents) * 100)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border-strong font-semibold">
                <td className="py-3 pl-4 text-fg">All clients</td>
                <td className="py-3 text-right font-mono text-fg">{formatNumber(totals.minutes)}</td>
                <td className="py-3 text-right font-mono text-fg">{formatNumber(totals.sms)}</td>
                <td className="py-3 text-right font-mono text-fg">{totals.numbers}</td>
                <td className="py-3 text-right font-mono text-fg">{money(totals.cost)}</td>
                <td className="py-3 text-right font-mono text-fg">{money(totals.billed)}</td>
                <td className="py-3 pr-4 text-right font-mono text-success-text">
                  {money(totals.billed - totals.cost)} <span className="text-fg-muted">{Math.round(margin(totals.cost, totals.billed) * 100)}%</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </section>
  );
}

/* ── Spend cap, payment, invoices ─────────────────────────────────────── */
function SpendCap({ b }: { b: BillingOverview }) {
  if (b.spendCapCents === null)
    return (
      <Card className="p-5">
        <h3 className="text-[14.5px] font-semibold text-fg">Spend cap</h3>
        <p className="mt-1 text-[13px] text-fg-muted">No cap set. Usage is billed as it accrues.</p>
      </Card>
    );
  const pct = (b.estimatedTotalCents / b.spendCapCents) * 100;
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[14.5px] font-semibold text-fg">Spend cap</h3>
        <span className="font-mono text-[13px] text-fg-secondary">
          {money(b.estimatedTotalCents)} <span className="text-fg-muted">of {moneyWhole(b.spendCapCents)}</span>
        </span>
      </div>
      <Progress label="Spend against cap" value={pct} tone={pct >= 90 ? "danger" : pct >= 75 ? "warning" : "brand"} />
      <p className="text-xs leading-5 text-fg-muted">
        When the organization reaches its cap, new outbound dials pause until an admin raises it. Calls already connected finish normally. Caps per
        client sub-account are planned.
      </p>
      <Button size="sm" className="self-start" onClick={() => stripeLater("Changing the spend cap")}>
        Adjust cap
      </Button>
    </Card>
  );
}

function PaymentMethod({ b }: { b: BillingOverview }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h3 className="text-[14.5px] font-semibold text-fg">Payment method</h3>
      {b.paymentMethod ? (
        <div className="flex items-center gap-3">
          <CreditCard className="size-5 text-fg-muted" aria-hidden />
          <div>
            <p className="text-[13px] text-fg">
              {b.paymentMethod.brand} <span className="font-mono">•••• {b.paymentMethod.last4}</span>
            </p>
            <p className="font-mono text-xs text-fg-muted">expires {b.paymentMethod.expires}</p>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-fg-muted">No card on file. Add one before your trial ends to keep dialing.</p>
      )}
      <Button size="sm" className="self-start" onClick={() => stripeLater("Updating the card")}>
        {b.paymentMethod ? "Update card" : "Add card"}
      </Button>
    </Card>
  );
}

const invoiceTone = { paid: "success", open: "warning", failed: "danger" } as const;

function Invoices({ b }: { b: BillingOverview }) {
  return (
    <Card className="flex flex-col">
      <h3 className="px-5 pt-5 text-[14.5px] font-semibold text-fg">Invoices</h3>
      {b.invoices.length === 0 ? (
        <EmptyState compact icon={FileText} title="No invoices yet" description="Your first invoice is issued when the current period closes." />
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {b.invoices.map((inv) => (
            <li key={inv.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
              <span className="flex-1 text-fg">{inv.period}</span>
              <Badge tone={invoiceTone[inv.status]} size="sm">
                {inv.status === "paid" ? "Paid" : inv.status === "open" ? "Open" : "Failed"}
              </Badge>
              <span className="w-24 text-right font-mono text-fg">{money(inv.totalCents)}</span>
              <Button variant="ghost" size="icon-sm" aria-label={`Download ${inv.period} invoice`} onClick={() => stripeLater("Invoice PDFs")}>
                <Download />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function BillingScreen() {
  const { data: b, isLoading, isError, refetch } = useBilling();
  const [plansOpen, setPlansOpen] = React.useState(false);

  return (
    <Page>
      <PageHeader
        title="Billing & usage"
        description="Organization-wide. One platform fee, metered usage at the same rates on every plan."
      />
      {isLoading ? (
        <div className="flex flex-col gap-6" aria-busy>
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-28" />
          <Skeleton className="h-56" />
        </div>
      ) : isError || !b ? (
        <ErrorState onRetry={() => refetch()} description="Billing details could not be loaded. Dialing and usage metering are not affected." />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <InvoiceLedger b={b} />
            <PlanPanel b={b} onChangePlan={() => setPlansOpen(true)} />
          </div>
          <UsageStrip b={b} />
          <Rebilling b={b} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SpendCap b={b} />
            <PaymentMethod b={b} />
            <Invoices b={b} />
          </div>
          <p className="text-xs text-fg-muted">
            New workspaces start with a {TRIAL.days}-day trial and {formatNumber(TRIAL.freeMinutes)} free minutes, no card required. Compliance tools
            are never billed separately.
          </p>
          <PlanDialog open={plansOpen} onOpenChange={setPlansOpen} current={b.planId} />
        </>
      )}
    </Page>
  );
}
