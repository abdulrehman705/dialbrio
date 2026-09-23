"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IntegrationStatus } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { Mono } from "@/components/ui/mono";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationRequired, ErrorState } from "@/components/states";
import { useIntegrations } from "@/lib/queries";
import { timeAgo } from "@/lib/utils";
import { SettingsCard } from "../kit";

const MAPPING = [
  { from: "Disposition", to: "Custom field · DialBrio last disposition", when: "After every call" },
  { from: "Lifecycle state", to: "Custom field · DialBrio lifecycle", when: "On change" },
  { from: "Call notes", to: "Contact note", when: "After every connected call" },
  { from: "Appointment", to: "Calendar event", when: "On booking" },
  { from: "DNC", to: "Tag · dnc + DND flag", when: "Immediately" },
];

export function CrmSettings() {
  const { data, isLoading, isError, refetch } = useIntegrations();
  const ghl = data?.find((i) => i.provider === "ghl");

  if (isLoading) return <Skeleton className="h-64" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!ghl || ghl.status === "not_connected")
    return <IntegrationRequired provider="GoHighLevel" reason="CRM settings apply once a GoHighLevel location is connected." />;

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        title="GoHighLevel"
        description="System of record for contacts, fields and calendars."
        actions={<IntegrationStatus status={ghl.status} size="sm" />}
      >
        <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
          <div>
            <dt className="text-xs text-fg-muted">Location</dt>
            <dd className="mt-0.5">
              <Mono>{ghl.connectedAccount}</Mono>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Last sync</dt>
            <dd className="mt-0.5 text-fg">{ghl.lastSyncAt ? timeAgo(ghl.lastSyncAt) : "Never"}</dd>
          </div>
        </dl>
        <Button asChild size="sm" className="self-start">
          <Link href="/app/integrations">
            Connection & sync errors <ArrowRight />
          </Link>
        </Button>
      </SettingsCard>
      <SettingsCard title="Outcome sync" description="What DialBrio writes back to GoHighLevel. Field mapping becomes editable in Phase 4.">
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {MAPPING.map((m) => (
            <li key={m.from} className="grid gap-1 px-3 py-2.5 text-[13px] sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-3">
              <span className="font-medium text-fg">{m.from}</span>
              <span className="flex items-center gap-1.5 text-fg-secondary">
                <ArrowRight className="size-3.5 text-fg-muted" aria-hidden />
                {m.to}
              </span>
              <span className="text-xs text-fg-muted">{m.when}</span>
            </li>
          ))}
        </ul>
      </SettingsCard>
    </div>
  );
}
