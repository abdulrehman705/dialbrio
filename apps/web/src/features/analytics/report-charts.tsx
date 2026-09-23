"use client";

import { format, parseISO } from "date-fns";
import { ChartColumn } from "lucide-react";
import type { DateRange, Report } from "@dialbrio/types";
import { BarsChart, ChartFigure, TrendChart, type ChartSeries } from "@/components/charts";
import { DISPOSITION_META } from "@/components/domain";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states";
import { formatNumber, formatPercent } from "@/lib/utils";

const volumeSeries: ChartSeries[] = [
  { key: "calls", label: "Dials", color: "chart-6" },
  { key: "connected", label: "Connected", color: "chart-1" },
];
const apptSeries: ChartSeries[] = [{ key: "appointments", label: "Appointments", color: "chart-1" }];
const rateSeries: ChartSeries[] = [{ key: "rate", label: "Connect rate", color: "chart-1" }];
const dispoSeries: ChartSeries[] = [{ key: "count", label: "Calls", color: "chart-2" }];
const stlSeries: ChartSeries[] = [{ key: "leads", label: "Leads", color: "chart-1" }];

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const tick = (s: string) => (isDate(s) ? format(parseISO(s), "MMM d") : s);
const fullLabel = (s: string) => (isDate(s) ? format(parseISO(s), "EEE, MMM d") : s);
const pct = (v: number) => formatPercent(v, 0);

function ChartCard({ title, description, loading, empty, children, className }: { title: string; description: string; loading: boolean; empty: boolean; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader title={title} description={description} />
      <CardContent>
        {loading ? <Skeleton className="h-60" /> : empty ? <EmptyState compact icon={ChartColumn} title="No data for this range" description="Try a longer date range or a different scope." /> : children}
      </CardContent>
    </Card>
  );
}

export function ReportCharts({ report, range, loading }: { report?: Report; range: DateRange; loading: boolean }) {
  const r = report;
  const series = r?.series ?? [];
  const empty = !r || series.every((p) => p.calls === 0);
  const unit = range === "today" ? "hour" : "day";
  const dispositions = [...(r?.dispositions ?? [])].sort((a, b) => b.count - a.count).map((d) => ({ ...d, label: DISPOSITION_META[d.code].label }));
  const bestHour = [...(r?.connectByHour ?? [])].sort((a, b) => b.rate - a.rate)[0];
  const stlTotal = (r?.speedToLeadBuckets ?? []).reduce((s, b) => s + b.leads, 0);
  const underFive = (r?.speedToLeadBuckets ?? []).slice(0, 2).reduce((s, b) => s + b.leads, 0);

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <ChartCard className="xl:col-span-8" title="Is dialing turning into conversations?" description={`Dials vs. live connects, per ${unit}`} loading={loading} empty={empty}>
        <ChartFigure
          legend={volumeSeries}
          summary={`Calls and connected calls per ${unit}. Total ${formatNumber(r?.totals.calls ?? 0)} calls, ${formatNumber(r?.totals.connected ?? 0)} connected.`}
        >
          <TrendChart data={series} xKey="date" series={volumeSeries} height={260} tickFormat={tick} labelFormat={fullLabel} />
        </ChartFigure>
      </ChartCard>

      <ChartCard className="xl:col-span-4" title="Are conversations becoming appointments?" description={`Appointments booked per ${unit}`} loading={loading} empty={empty}>
        <ChartFigure summary={`Appointments per ${unit}. Total ${formatNumber(r?.totals.appointments ?? 0)}.`}>
          <BarsChart data={series} xKey="date" series={apptSeries} height={260} tickFormat={tick} labelFormat={fullLabel} />
        </ChartFigure>
      </ChartCard>

      <ChartCard className="xl:col-span-6" title="When should agents be dialing?" description="Connect rate by hour of day" loading={loading} empty={!r?.connectByHour.length}>
        <ChartFigure summary={`Connect rate by hour. Best hour ${bestHour?.hour}: ${bestHour ? pct(bestHour.rate) : ""}.`}>
          <BarsChart data={r?.connectByHour ?? []} xKey="hour" series={rateSeries} height={240} axisFormat={pct} valueFormat={(v) => formatPercent(v)} />
        </ChartFigure>
        {bestHour && (
          <p className="mt-3 text-xs text-fg-muted">
            People pick up most at <span className="font-medium text-fg-secondary">{bestHour.hour}</span> (<span className="font-mono">{formatPercent(bestHour.rate)}</span>). Schedule your biggest dial blocks in the late afternoon.
          </p>
        )}
      </ChartCard>

      <ChartCard className="xl:col-span-6" title="How are calls ending?" description="Dispositions recorded, most frequent first" loading={loading} empty={!dispositions.length}>
        <ChartFigure summary={`Dispositions: ${dispositions.map((d) => `${d.label} ${d.count}`).join(", ")}.`}>
          <BarsChart data={dispositions} xKey="label" series={dispoSeries} layout="horizontal" height={280} categoryWidth={104} />
        </ChartFigure>
      </ChartCard>

      <ChartCard className="xl:col-span-12" title="How fast are new leads getting a first call?" description="Time from lead creation to first dial attempt" loading={loading} empty={!stlTotal}>
        <div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-center">
          <ChartFigure summary={`Speed to lead distribution: ${(r?.speedToLeadBuckets ?? []).map((b) => `${b.bucket} ${b.leads}`).join(", ")}.`}>
            <BarsChart data={r?.speedToLeadBuckets ?? []} xKey="bucket" series={stlSeries} height={200} />
          </ChartFigure>
          <div className="dark rounded-lg bg-surface p-5 text-fg">
            <p className="text-[13px] text-fg-secondary">Called within 5 minutes</p>
            <p className="mt-1 font-display text-[40px] leading-10 font-bold tracking-[-0.04em] text-brand-text">{stlTotal ? formatPercent(underFive / stlTotal, 0) : "–"}</p>
            <p className="mt-2 text-xs leading-5 text-fg-secondary">
              {formatNumber(underFive)} of {formatNumber(stlTotal)} new leads. Contact rates fall off hard after five minutes, so this is the number to protect.
            </p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
