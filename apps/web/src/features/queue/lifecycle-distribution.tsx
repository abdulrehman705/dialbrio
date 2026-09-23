"use client";

import { LEAD_STATES, type LeadState } from "@dialbrio/types";
import { LEAD_STATE_META } from "@/components/domain";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatNumber } from "@/lib/utils";

const barClass: Record<LeadState, string> = { fresh: "bg-lead-fresh", warm: "bg-lead-warm", aged: "bg-lead-aged", zombie: "bg-lead-zombie" };

/** Waiting leads by lifecycle state — a first-class state, not a tag. */
export function LifecycleDistribution({ byState, loading }: { byState?: Record<LeadState, number>; loading?: boolean }) {
  const total = byState ? LEAD_STATES.reduce((s, k) => s + byState[k], 0) : 0;
  return (
    <Card>
      <CardHeader title="What's in the queues" description="Every queued lead sits in exactly one lifecycle state. Paused queues are included." />
      <CardContent>
        {loading || !byState ? (
          <div className="space-y-3">
            <Skeleton className="h-2" />
            <Skeleton className="h-10" />
          </div>
        ) : (
          <>
            <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-[3px]" role="img" aria-label={LEAD_STATES.map((s) => `${LEAD_STATE_META[s].label} ${byState[s]}`).join(", ")}>
              {LEAD_STATES.map((s) => (byState[s] > 0 ? <span key={s} className={cn("h-full", barClass[s])} style={{ width: `${(byState[s] / total) * 100}%` }} /> : null))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
              {LEAD_STATES.map((s) => {
                const meta = LEAD_STATE_META[s];
                return (
                  <div key={s} className="min-w-0">
                    <dt className="flex items-center gap-2 text-[13px] text-fg-secondary">
                      <span className={cn("size-2 rounded-[2px]", barClass[s])} aria-hidden />
                      {meta.label}
                      <span className="font-mono text-xs text-fg-muted">{total ? Math.round((byState[s] / total) * 100) : 0}%</span>
                    </dt>
                    <dd className="mt-0.5 font-display text-2xl font-bold tracking-[-0.03em] text-fg">{formatNumber(byState[s])}</dd>
                    <dd className="text-xs leading-4 text-fg-muted">{meta.description}</dd>
                  </div>
                );
              })}
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}
