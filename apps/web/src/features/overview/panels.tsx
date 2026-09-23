"use client";

import Link from "next/link";
import { ArrowRight, Hash, ListOrdered, MessageSquare, MessagesSquare, Phone, TriangleAlert } from "lucide-react";
import { LEAD_STATES, NUMBER_HEALTH, type LeadState, type OverviewData } from "@dialbrio/types";
import { BarsChart, ChartFigure, type ChartSeries } from "@/components/charts";
import { LEAD_STATE_META, NUMBER_HEALTH_META, NumberHealth } from "@/components/domain";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states";
import { cn, formatListTime, formatNumber, formatPercent, initials } from "@/lib/utils";
import { formatMinutes } from "./use-now";

type P = { data?: OverviewData; loading: boolean; className?: string };

function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8" />
      ))}
    </div>
  );
}

// ── Call activity ────────────────────────────────────────────────────────
const activitySeries: ChartSeries[] = [
  { key: "calls", label: "Dials", color: "chart-6" },
  { key: "connected", label: "Connected", color: "chart-1" },
];

export function CallActivityCard({ data, loading, className }: P) {
  const rows = data?.callActivity ?? [];
  const done = rows.filter((r) => r.calls > 0);
  const peak = done.reduce((best, r) => (r.connected / Math.max(1, r.calls) > best.rate ? { hour: r.hour, rate: r.connected / Math.max(1, r.calls) } : best), { hour: "", rate: 0 });
  return (
    <Card className={className}>
      <CardHeader title="When are people picking up?" description="Dials vs. live connects by hour, today" />
      <CardContent>
        {loading ? (
          <Skeleton className="h-60" />
        ) : done.length === 0 ? (
          <EmptyState compact icon={Phone} title="No calls yet today" description="Hourly activity appears after the first dial." />
        ) : (
          <ChartFigure
            legend={activitySeries}
            summary={`Calls and connects by hour. Best connect rate at ${peak.hour}: ${formatPercent(peak.rate)}. ${done.map((r) => `${r.hour}: ${r.calls} calls, ${r.connected} connected`).join("; ")}.`}
          >
            <BarsChart data={rows} xKey="hour" series={activitySeries} height={240} mutedIndex={(i) => (rows[i]?.calls ?? 0) === 0} />
          </ChartFigure>
        )}
        {!loading && peak.hour && (
          <p className="mt-3 text-xs text-fg-muted">
            Best hour so far is <span className="font-medium text-fg-secondary">{peak.hour}</span>, connecting <span className="font-mono">{formatPercent(peak.rate)}</span> of dials. Later hours are greyed until they happen.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Queue health ─────────────────────────────────────────────────────────
export function QueueHealthCard({ data, loading, className }: P) {
  const rows = data?.queueHealth ?? [];
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        title="Is anyone waiting too long?"
        description="Oldest lead in each queue against its target"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/queue">
              Queues <ArrowRight />
            </Link>
          </Button>
        }
      />
      <CardContent className="flex-1">
        {loading ? (
          <PanelSkeleton rows={5} />
        ) : rows.length === 0 ? (
          <EmptyState compact icon={ListOrdered} title="No queues configured" description="Create a campaign to generate a dial queue." />
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((q) => {
              const ratio = q.oldestMinutes / q.slaMinutes;
              const breach = q.enabled && ratio > 1;
              const near = q.enabled && ratio > 0.7 && !breach;
              return (
                <li key={q.queueId} className={cn(!q.enabled && "opacity-70")}>
                  <div className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium text-fg">{q.name}</span>
                      {!q.enabled && <span className="text-xs text-fg-muted">(paused)</span>}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-fg-secondary">{formatNumber(q.waiting)} waiting</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-active" aria-hidden>
                    <div className={cn("h-full rounded-full", breach ? "bg-danger" : near ? "bg-warning" : "bg-success")} style={{ width: `${q.enabled ? Math.min(100, Math.max(3, ratio * 100)) : 0}%` }} />
                  </div>
                  <p className={cn("mt-1 flex items-center gap-1 text-xs", breach ? "text-danger-text" : "text-fg-muted")}>
                    {breach && <TriangleAlert className="size-3" aria-hidden />}
                    {q.enabled ? (
                      <>
                        Oldest {formatMinutes(q.oldestMinutes)}, target {formatMinutes(q.slaMinutes)}
                        {breach && ", over target"}
                      </>
                    ) : (
                      "Not dialing. Turn it on in Queue."
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ── Lead lifecycle ───────────────────────────────────────────────────────
const leadBg: Record<LeadState, string> = { fresh: "bg-lead-fresh", warm: "bg-lead-warm", aged: "bg-lead-aged", zombie: "bg-lead-zombie" };

export function LifecycleCard({ data, loading, className, personal }: P & { personal?: boolean }) {
  const counts = data?.lifecycle;
  const total = counts ? LEAD_STATES.reduce((s, k) => s + counts[k], 0) : 0;
  return (
    <Card className={className}>
      <CardHeader title={personal ? "Lead mix in your campaigns" : "How fresh is the pipeline?"} description={counts ? `${formatNumber(total)} open leads by lifecycle state` : "Open leads by lifecycle state"} />
      <CardContent>
        {loading || !counts ? (
          <PanelSkeleton />
        ) : total === 0 ? (
          <EmptyState compact icon={ListOrdered} title="No open leads" description="Leads appear here once GoHighLevel syncs contacts." />
        ) : (
          <>
            <div className="flex h-2 gap-0.5 overflow-hidden rounded-[3px]" role="img" aria-label={LEAD_STATES.map((s) => `${LEAD_STATE_META[s].label} ${counts[s]}`).join(", ")}>
              {LEAD_STATES.map((s) => (
                <div key={s} className={cn("h-full", leadBg[s])} style={{ width: `${(counts[s] / total) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LEAD_STATES.map((s) => (
                <li key={s} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="flex items-center gap-2 text-fg-secondary">
                    <span className={cn("size-2 rounded-[2px]", leadBg[s])} aria-hidden />
                    {LEAD_STATE_META[s].label}
                    <span className="text-xs text-fg-muted max-sm:hidden">{LEAD_STATE_META[s].description}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs">
                    <span className="text-fg">{formatNumber(counts[s])}</span>
                    <span className="ml-2 inline-block w-9 text-right text-fg-muted">{formatPercent(counts[s] / total, 0)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Funnel ───────────────────────────────────────────────────────────────
export function FunnelCard({ data, loading, className }: P) {
  const steps = data?.funnel ?? [];
  const top = steps[0]?.value ?? 0;
  return (
    <Card className={className}>
      <CardHeader title="Where do leads drop off?" description="From new lead to booked appointment" />
      <CardContent>
        {loading ? (
          <PanelSkeleton rows={5} />
        ) : !top ? (
          <EmptyState compact icon={ListOrdered} title="No funnel data yet" />
        ) : (
          <ol className="flex flex-col gap-2.5">
            {steps.map((s, i) => {
              const prev = steps[i - 1];
              return (
                <li key={s.stage}>
                  <div className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="text-fg-secondary">{s.stage}</span>
                    <span className="font-mono text-xs">
                      <span className="text-fg">{formatNumber(s.value)}</span>
                      <span className="ml-2 inline-block w-9 text-right text-fg-muted">{prev ? formatPercent(s.value / prev.value, 0) : ""}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-surface-active" aria-hidden>
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(2, (s.value / top) * 100)}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {!loading && top > 0 && (
          <p className="mt-3 text-xs text-fg-muted">Percentages are step-to-step conversion.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Number health ────────────────────────────────────────────────────────
export function NumberHealthCard({ data, loading, className }: P) {
  const nh = data?.numberHealth;
  const total = nh ? NUMBER_HEALTH.reduce((s, k) => s + nh[k], 0) : 0;
  const risky = nh ? nh.at_risk + nh.watch : 0;
  return (
    <Card className={className}>
      <CardHeader
        title="Are our caller IDs getting answered?"
        description={nh ? `${total} numbers in rotation, ${risky} need a look` : "Caller ID reputation"}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/numbers">
              Numbers <ArrowRight />
            </Link>
          </Button>
        }
      />
      <CardContent>
        {loading || !nh ? (
          <PanelSkeleton />
        ) : total === 0 ? (
          <EmptyState compact icon={Hash} title="No phone numbers" description="Connect Twilio to add caller IDs." />
        ) : (
          <dl className="divide-y divide-border">
            {NUMBER_HEALTH.map((h) => (
              <div key={h} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <dt className="min-w-0">
                  <NumberHealth health={h} size="sm" />
                  <p className="mt-1 truncate text-xs text-fg-muted">{NUMBER_HEALTH_META[h].description}</p>
                </dt>
                <dd className="font-display text-xl font-bold text-fg">{nh[h]}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

// ── Recent conversations ─────────────────────────────────────────────────
export function RecentConversationsCard({ data, loading, className, personal }: P & { personal?: boolean }) {
  const rows = data?.recentConversations ?? [];
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        title="Recent conversations"
        description={personal ? "Latest replies and calls on your leads" : "Latest SMS and calls across the team"}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/conversations">
              Inbox <ArrowRight />
            </Link>
          </Button>
        }
      />
      {loading ? (
        <div className="space-y-2 px-5 pb-5">
          <PanelSkeleton rows={5} />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState compact icon={MessagesSquare} title="No conversations yet" description="Replies and calls will show up here." />
      ) : (
        <ul className="grid grid-cols-1 divide-y divide-border border-t border-border xl:grid-cols-2 xl:divide-y-0 xl:[&>li]:border-b xl:[&>li:nth-child(odd)]:border-r">
          {rows.map((c) => (
            <li key={c.id} className="min-w-0 border-border">
              <Link href={`/app/conversations?id=${c.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-hover">
                <Avatar name={c.contactName} initials={initials(c.contactName)} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-[13px]", c.unreadCount ? "font-semibold text-fg" : "font-medium text-fg")}>{c.contactName}</span>
                    <span className="shrink-0 font-mono text-[11px] text-fg-muted">{formatListTime(c.lastMessageAt)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-fg-muted">
                    {c.lastChannel === "call" ? <Phone className="size-3 shrink-0" aria-label="Call" /> : <MessageSquare className="size-3 shrink-0" aria-label="SMS" />}
                    <span className="truncate">{c.lastMessagePreview}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-[11px] text-fg-muted">
                    <span>{LEAD_STATE_META[c.leadState].label}</span>
                    <span aria-hidden>·</span>
                    <span>{c.assigneeName ?? "Unassigned"}</span>
                    {c.unreadCount > 0 && <span className="ml-auto rounded-[4px] bg-brand-solid px-1.5 py-px font-mono text-[10px] text-white">{c.unreadCount} new</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
