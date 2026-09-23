"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { KpiStrip } from "@/components/charts/kpi-strip";
import { useQueues, useQueueStats } from "@/lib/queries";
import { useCan } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page-header";
import { formatNumber } from "@/lib/utils";
import { LifecycleDistribution } from "./lifecycle-distribution";
import { QueueDetail } from "./queue-detail";
import { QueueList } from "./queue-list";
import { formatMinutes } from "./utils";

export function QueueManager() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("queue");
  const stats = useQueueStats();
  const queues = useQueues();
  const canCreate = useCan("campaigns.manage");
  const selected = queues.data?.find((q) => q.id === selectedId);

  const select = (id: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (id) sp.set("queue", id);
    else sp.delete("queue");
    router.replace(`/app/queue${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const s = stats.data;
  return (
    <Page>
      <PageHeader
        title="Queue"
        description="Who gets called next, in what order, and why."
        actions={
          canCreate && (
            <Button asChild variant="primary">
              <Link href="/app/campaigns/new">
                <Plus /> New campaign
              </Link>
            </Button>
          )
        }
      />

      <KpiStrip
        label="Queue metrics"
        loading={!s}
        items={[
          { label: "Waiting", value: s ? formatNumber(s.waiting) : null, note: "across queues that are on" },
          { label: "On a call now", value: s?.activeCalls ?? null, note: "live conversations" },
          { label: "Agents free", value: s?.availableAgents ?? null, note: s && s.availableAgents === 0 ? "everyone is busy" : "ready for the next lead", noteTone: s && s.availableAgents === 0 ? "warning" : "muted" },
          { label: "Oldest lead", value: s ? formatMinutes(s.oldestLeadMinutes) : null, note: "longest current wait", noteTone: s && s.oldestLeadMinutes > 60 ? "warning" : "muted" },
          { label: "Average wait", value: s ? formatMinutes(s.avgWaitMinutes) : null, note: "queued to first dial" },
          { label: "Dialed per hour", value: s ? formatNumber(s.throughputPerHour) : null, note: "all queues" },
        ]}
      />

      <LifecycleDistribution byState={s?.byState} loading={stats.isLoading} />

      <QueueList
        queues={queues.data}
        loading={queues.isLoading}
        error={queues.isError}
        onRetry={() => void queues.refetch()}
        selectedId={selectedId}
        onSelect={select}
      />

      <p className="text-xs text-fg-muted">
        A lead is reserved for one agent at a time. If nobody dials it within 60 seconds, it goes back into the queue.
      </p>

      <QueueDetail queue={selected} open={!!selected} onOpenChange={(o) => !o && select(null)} />
    </Page>
  );
}
