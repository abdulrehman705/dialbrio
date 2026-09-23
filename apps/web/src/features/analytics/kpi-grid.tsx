"use client";

import type { DateRange, Report } from "@dialbrio/types";
import { KpiStrip } from "@/components/charts/kpi-strip";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils";

type Totals = Report["totals"];
type Key = keyof Totals;
type Def = { key: Key; label: string; fmt: (v: number) => string; invert?: boolean };

const OUTCOMES: Def[] = [
  { key: "calls", label: "Dials", fmt: formatNumber },
  { key: "connected", label: "Connected", fmt: formatNumber },
  { key: "connectRate", label: "Connect rate", fmt: (v) => formatPercent(v) },
  { key: "appointments", label: "Appointments", fmt: formatNumber },
  { key: "appointmentRate", label: "Booked per connect", fmt: (v) => formatPercent(v) },
  { key: "speedToLeadSec", label: "Speed to lead", fmt: formatDuration, invert: true },
];

const EFFORT: Def[] = [
  { key: "talkTimeSec", label: "Talk time", fmt: formatDuration },
  { key: "avgCallSec", label: "Avg call length", fmt: formatDuration },
  { key: "retries", label: "Retries", fmt: formatNumber, invert: true },
  { key: "noAnswers", label: "No answers", fmt: formatNumber, invert: true },
  { key: "dnc", label: "DNC requests", fmt: formatNumber, invert: true },
  { key: "agentIdleSec", label: "Agent idle time", fmt: formatDuration, invert: true },
];

const vs: Record<DateRange, string> = { today: "vs yesterday", "7d": "vs prior 7d", "30d": "vs prior 30d", "90d": "vs prior 90d" };

function Strip({ defs, report, range, loading, title }: { defs: Def[]; report?: Report; range: DateRange; loading: boolean; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[13px] font-medium text-fg-secondary">{title}</h2>
      <KpiStrip
        label={title}
        loading={loading || !report}
        deltaLabel={vs[range]}
        items={defs.map((k) => {
          const cur = report?.totals[k.key];
          const prev = report?.previous[k.key];
          return { label: k.label, value: cur !== undefined ? k.fmt(cur) : null, delta: cur !== undefined && prev ? (cur - prev) / prev : undefined, invert: k.invert };
        })}
      />
    </div>
  );
}

export function KpiGrid({ report, range, loading }: { report?: Report; range: DateRange; loading: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      <Strip title="Outcomes" defs={OUTCOMES} report={report} range={range} loading={loading} />
      <Strip title="Effort and list hygiene" defs={EFFORT} report={report} range={range} loading={loading} />
    </div>
  );
}
