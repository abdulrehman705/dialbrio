"use client";

import * as React from "react";
import { ANNUAL_DISCOUNT, PLANS, formatPlanPrice, type PlanId } from "@dialbrio/types";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { PlannedMarker } from "@/components/app/planned-marker";

/** Plan comparison. Changing plan is not wired yet — it will run through Stripe checkout (Phase 7). */
export function PlanDialog({ open, onOpenChange, current }: { open: boolean; onOpenChange: (v: boolean) => void; current: PlanId }) {
  const [interval, setInterval] = React.useState<"monthly" | "annual">("monthly");
  const annual = interval === "annual";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Compare plans"
        description="Every plan uses the same usage rates. Compliance tools are included on all of them."
        className="max-w-5xl"
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-4">
          <Segmented
            label="Billing interval"
            value={interval}
            onValueChange={setInterval}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "annual", label: `Annual −${ANNUAL_DISCOUNT * 100}%` },
            ]}
          />
        </div>
        <ul className="grid gap-px border-y border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => {
            const isCurrent = p.id === current;
            const inherits = p.inheritsFrom ? PLANS.find((x) => x.id === p.inheritsFrom)?.name : null;
            return (
              <li key={p.id} className={cn("flex flex-col gap-4 bg-surface p-5", isCurrent && "bg-brand-soft")}>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-fg">{p.name}</h3>
                    {isCurrent && <span className="font-mono text-[11px] font-semibold text-brand-text">Current plan</span>}
                  </div>
                  <p className="mt-1 text-[13px] leading-5 text-fg-muted">{p.audience}</p>
                </div>
                <p className="flex items-baseline gap-1">
                  <span className="font-display text-[32px] leading-none font-bold tracking-[-0.03em] text-fg">{formatPlanPrice(p, annual)}</span>
                  {p.monthlyCents !== null && <span className="text-[13px] text-fg-muted">/mo{annual && ", billed yearly"}</span>}
                </p>
                <ul className="flex flex-col gap-1.5 text-[13px] text-fg-secondary">
                  {p.includedSeats !== null && !p.highlights.some((h) => /\bseat/.test(h)) && (
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                      <span>
                        {p.includedSeats} {p.includedSeats === 1 ? "seat" : "seats"} included
                      </span>
                    </li>
                  )}
                  {inherits && (
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                      <span>Everything in {inherits}</span>
                    </li>
                  )}
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                      <span>
                        {h}
                        <PlannedMarker highlight={h} />
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        <DialogFooter className="flex-wrap justify-between border-t-0">
          <p className="max-w-lg text-xs leading-5 text-fg-muted">
            Switching plans isn't self-serve yet. It moves to Stripe checkout in Phase 7; until then, contact support to change plan.
          </p>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
