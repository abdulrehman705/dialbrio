"use client";

import type { DateRange, OverviewData } from "@dialbrio/types";
import { KpiStrip } from "@/components/charts/kpi-strip";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils";
import { delta, formatMinutes } from "./use-now";

const rangeLabel: Record<string, { calls: string; vs: string }> = {
  today: { calls: "Calls today", vs: "vs yesterday" },
  "7d": { calls: "Calls, 7 days", vs: "vs prior 7 days" },
  "30d": { calls: "Calls, 30 days", vs: "vs prior 30 days" },
};

export function KpiRow({ data, range, loading }: { data?: OverviewData; range: DateRange; loading: boolean }) {
  const k = data?.kpis;
  const l = rangeLabel[range] ?? rangeLabel.today!;
  return (
    <KpiStrip
      label="Key metrics"
      loading={loading || !k}
      deltaLabel={l.vs}
      items={
        k
          ? [
              { label: l.calls, value: formatNumber(k.callsToday.value), delta: delta(k.callsToday.value, k.callsToday.previous) },
              { label: "Connect rate", value: formatPercent(k.connectRate.value), delta: delta(k.connectRate.value, k.connectRate.previous) },
              { label: "Appointments", value: formatNumber(k.appointments.value), delta: delta(k.appointments.value, k.appointments.previous) },
              { label: "Speed to lead", value: formatDuration(k.speedToLeadSec.value), delta: delta(k.speedToLeadSec.value, k.speedToLeadSec.previous), invert: true },
              {
                label: "Agents dialing",
                value: (
                  <>
                    {k.activeAgents.value}
                    <span className="text-lg font-semibold text-fg-muted"> of {k.activeAgents.total}</span>
                  </>
                ),
                note: `${k.activeAgents.total - k.activeAgents.value} on break or offline`,
              },
              {
                label: "Waiting in queue",
                value: formatNumber(k.queueWaiting.value),
                note: `Oldest ${formatMinutes(k.queueWaiting.oldestMinutes)}`,
                noteTone: k.queueWaiting.oldestMinutes > 60 ? "warning" : "muted",
              },
            ]
          : ["Calls today", "Connect rate", "Appointments", "Speed to lead", "Agents dialing", "Waiting in queue"].map((label) => ({ label, value: null }))
      }
    />
  );
}
