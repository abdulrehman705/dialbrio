"use client";

import * as React from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { DialerSession } from "@dialbrio/types";
import { LeadStateBadge } from "@/components/domain";
import Counter from "@/components/reactbits/Counter";
import StatusMark, { type StatusMarkStatus } from "@/components/reactbits/StatusMark";
import { Tooltip } from "@/components/ui/tooltip";
import { API_MODE } from "@/lib/api";
import { useRealtimeEvent } from "@/lib/realtime/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration, formatPercent } from "@/lib/utils";
import { useDialerStore } from "./store";

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-fg-muted">{label}</span>
      <span className="text-[14px] font-semibold text-fg tabular">{value}</span>
    </div>
  );
}

/**
 * Session count that rolls its digits when it increments (React Bits Counter). Sized to the 14px
 * metric line so nothing shifts; screen readers get the plain number; reduced motion shows it static.
 */
function RollingCount({ value }: { value: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{value}</>;
  return (
    <>
      <span aria-hidden className="inline-flex h-[21px] items-center">
        <Counter
          value={value}
          fontSize={14}
          padding={7}
          gap={0}
          horizontalPadding={0}
          borderRadius={0}
          gradientHeight={0}
          gradientFrom="transparent"
          digitStyle={{ width: "1ch" }}
        />
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}

type SyncPhase = Extract<StatusMarkStatus, "pending" | "running" | "done" | "failed">;
const SYNC_TEXT: Record<SyncPhase, string> = {
  pending: "Queued for GoHighLevel",
  running: "Syncing to GoHighLevel",
  done: "Synced to GoHighLevel",
  failed: "Sync failed, will retry",
};

/**
 * CRM sync state for the last saved outcome: queued → syncing → synced (or failed), driven by the
 * realtime `sync.status` event. The demo API doesn't emit sync events, so in mock mode the
 * lifecycle completes on a short timer and is labelled as simulated.
 */
function useOutcomeSync(outcomeKey: object | null) {
  const [phase, setPhase] = React.useState<SyncPhase>("pending");
  React.useEffect(() => {
    if (!outcomeKey) return;
    setPhase("pending");
    if (API_MODE !== "mock") return;
    const t1 = setTimeout(() => setPhase("running"), 350);
    const t2 = setTimeout(() => setPhase("done"), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [outcomeKey]);
  useRealtimeEvent("sync.status", (e) => {
    if (!outcomeKey) return;
    setPhase(e.state === "synced" ? "done" : e.state === "error" ? "failed" : "running");
  });
  return phase;
}

/** Session stats · next lead preview · CRM sync state. */
export function SessionFooter({ session, className }: { session: DialerSession; className?: string }) {
  const next = useDialerStore((s) => s.nextLead);
  const lastOutcome = useDialerStore((s) => s.lastOutcome);
  const st = session.stats;
  const sync = useOutcomeSync(lastOutcome);

  return (
    <div className={cn("grid gap-3 border-t border-border bg-surface px-4 py-3 md:px-5 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6", className)}>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Metric label="Calls" value={<RollingCount value={st.calls} />} />
        <Metric label="Connected" value={<RollingCount value={st.connected} />} />
        <Metric label="Connect rate" value={st.calls ? formatPercent(st.connected / st.calls, 0) : "—"} />
        <Metric label="Appointments" value={<RollingCount value={st.appointments} />} />
        <Metric label="Voicemails dropped" value={<RollingCount value={st.voicemailsDropped} />} />
        <Metric label="Talk time" value={formatDuration(st.talkTimeSec)} />
      </div>

      <div className="flex min-w-0 items-center gap-2.5 lg:border-l lg:border-border lg:pl-6">
        <span className="shrink-0 text-xs text-fg-muted">Up next</span>
        <ArrowRight className="size-3.5 shrink-0 text-fg-muted" aria-hidden />
        {next ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-[13px] font-medium text-fg">
              {next.contact.firstName} {next.contact.lastName}
            </span>
            <LeadStateBadge state={next.contact.leadState} size="sm" explain={false} />
            <span className="truncate text-xs text-fg-muted max-xl:hidden">{next.queueReason}</span>
          </div>
        ) : (
          <Skeleton className="h-4 w-48" />
        )}
      </div>

      <div className="flex min-w-0 items-center gap-2 text-xs text-fg-muted" role="status" aria-live="polite">
        {lastOutcome ? (
          <>
            <span aria-hidden className="inline-flex shrink-0">
              <StatusMark status={sync} size={16} strokeWidth={2} color="var(--fg-muted)" strike={false} />
            </span>
            <span className="truncate">
              {lastOutcome.label} · {lastOutcome.name}
            </span>
            <Tooltip content={API_MODE === "mock" ? "Simulated in demo. Live sync status comes from GoHighLevel webhooks." : "Sync status from GoHighLevel"}>
              <span tabIndex={0} className={cn("shrink-0 font-medium", sync === "done" ? "text-success-text" : sync === "failed" ? "text-danger-text" : "text-fg-secondary")}>
                {SYNC_TEXT[sync]}
              </span>
            </Tooltip>
          </>
        ) : (
          <>
            <RefreshCw className="size-3.5 shrink-0" aria-hidden />
            <span>Outcomes sync to GoHighLevel after each disposition</span>
          </>
        )}
      </div>
    </div>
  );
}
