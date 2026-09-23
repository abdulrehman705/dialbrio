"use client";

import Link from "next/link";
import { PLANS } from "@dialbrio/types";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states";
import { useBilling } from "@/lib/queries";
import { money, moneyWhole, periodInfo } from "@/features/billing/format";
import { PlannedCard, SettingRow, SettingsCard } from "../kit";

export function BillingSettings() {
  const { data: b, isLoading, isError, refetch } = useBilling();
  if (isLoading) return <Skeleton className="h-56" />;
  if (isError || !b) return <ErrorState onRetry={() => refetch()} />;
  const plan = PLANS.find((p) => p.id === b.planId)!;
  const period = periodInfo(b.periodStart, b.periodEnd);
  const capPct = b.spendCapCents ? (b.estimatedTotalCents / b.spendCapCents) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        title="Plan"
        description={`${plan.name} · ${plan.monthlyCents !== null ? `${moneyWhole(plan.monthlyCents)}/mo` : "custom pricing"} · billed ${b.interval}`}
        actions={
          <Button asChild size="sm">
            <Link href="/app/billing">
              Billing & usage <ArrowRight />
            </Link>
          </Button>
        }
      >
        <SettingRow label="Current period" description={`Closes ${period.closes}. Usage is billed in arrears at the same rates on every plan.`}>
          <span className="font-mono text-[13px] text-fg">{money(b.estimatedTotalCents)} so far</span>
        </SettingRow>
        <SettingRow label="Seats" description={`$59 per extra seat, or $225 for a 5-pack. Prorated daily.`}>
          <span className="font-mono text-[13px] text-fg">
            {b.seats.used} in use <span className="text-fg-muted">/ {b.seats.included} included</span>
          </span>
        </SettingRow>
        {b.spendCapCents !== null && (
          <SettingRow label="Spend cap" description="New outbound dials pause at the cap until an admin raises it.">
            <div className="flex w-56 flex-col gap-1.5">
              <span className="text-right font-mono text-[13px] text-fg">{moneyWhole(b.spendCapCents)}</span>
              <Progress label="Spend against cap" value={capPct} tone={capPct >= 90 ? "danger" : capPct >= 75 ? "warning" : "brand"} />
            </div>
          </SettingRow>
        )}
      </SettingsCard>
      <PlannedCard
        title="Client billing & margins"
        phase="Phase 7"
        description="Set what each client pays for seats and minutes. DialBrio meters usage per sub-account and generates the invoice; you keep the spread."
        points={["Client rates per minute, SMS and seat", "Invoices generated per sub-account", "Spend caps per client", "Margin report across all clients"]}
      />
    </div>
  );
}
