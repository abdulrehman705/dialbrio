"use client";

import Link from "next/link";
import { ArrowRight, Hash } from "lucide-react";
import { NUMBER_HEALTH, type NumberHealth as NumberHealthT } from "@dialbrio/types";
import { NumberHealth } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { Mono } from "@/components/ui/mono";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { usePhoneNumbers } from "@/lib/queries";
import { formatPercent, formatPhone } from "@/lib/utils";
import { SettingsCard } from "../kit";

export function NumbersSettings() {
  const { data, isLoading, isError, refetch } = usePhoneNumbers();
  const counts = NUMBER_HEALTH.map((h) => [h, (data ?? []).filter((n) => n.health === h).length] as [NumberHealthT, number]);
  const flagged = (data ?? []).filter((n) => n.health === "at_risk" || n.health === "watch");

  return (
    <SettingsCard
      title="Caller ID inventory"
      description="Purchase, assignment and rotation live in Phone Numbers (Phase 3). Health is monitored continuously."
      actions={
        <Button asChild size="sm">
          <Link href="/app/numbers">
            Phone numbers <ArrowRight />
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : isError ? (
        <ErrorState compact onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState compact icon={Hash} title="No numbers yet" description="Connect Twilio in Integrations to import your numbers." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {counts.map(([h, n]) => (
              <span key={h} className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
                <NumberHealth health={h} size="sm" />
                <span className="text-[13px] font-semibold text-fg tabular">{n}</span>
              </span>
            ))}
          </div>
          {flagged.length > 0 && (
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {flagged.map((n) => (
                <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                  <span className="text-[13px] text-fg">
                    <Mono>{formatPhone(n.number)}</Mono> <span className="text-fg-muted">· {n.friendlyName}</span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-fg-muted">
                    Answer rate <span className="tabular">{formatPercent(n.answerRate, 0)}</span>
                    <NumberHealth health={n.health} size="sm" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </SettingsCard>
  );
}
