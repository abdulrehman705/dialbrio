"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import type { DialerSession } from "@dialbrio/types";
import { CRMStatus, LeadStateBadge } from "@/components/domain";
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

/** Session stats · next lead preview · CRM sync state. */
export function SessionFooter({ session, className }: { session: DialerSession; className?: string }) {
  const next = useDialerStore((s) => s.nextLead);
  const lastOutcome = useDialerStore((s) => s.lastOutcome);
  const st = session.stats;

  return (
    <div className={cn("grid gap-3 border-t border-border bg-surface px-4 py-3 md:px-5 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6", className)}>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Metric label="Calls" value={st.calls} />
        <Metric label="Connected" value={st.connected} />
        <Metric label="Connect rate" value={st.calls ? formatPercent(st.connected / st.calls, 0) : "—"} />
        <Metric label="Appointments" value={st.appointments} />
        <Metric label="Voicemails dropped" value={st.voicemailsDropped} />
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

      <div className="flex min-w-0 items-center gap-2 text-xs text-fg-muted">
        <RefreshCw className="size-3.5 shrink-0" aria-hidden />
        {lastOutcome ? (
          <>
            <span className="truncate">
              {lastOutcome.label} · {lastOutcome.name}
            </span>
            <CRMStatus state="pending" size="sm" />
          </>
        ) : (
          <span>Outcomes sync to GoHighLevel after each disposition</span>
        )}
      </div>
    </div>
  );
}
