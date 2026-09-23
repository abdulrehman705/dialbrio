"use client";

import type { AgentActivity } from "@dialbrio/types";
import { KpiStrip } from "@/components/charts/kpi-strip";
import { useDialerSession } from "@/lib/queries";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils";

/** Agent view: personal metrics only (no team data). */
export function PersonalKpis({ me, loading }: { me?: AgentActivity; loading: boolean }) {
  const session = useDialerSession();
  const vm = session.data?.stats.voicemailsDropped;
  return (
    <KpiStrip
      label="Your metrics today"
      loading={loading || !me}
      items={[
        { label: "Dials today", value: me && formatNumber(me.callsToday) },
        { label: "Connected", value: me && formatNumber(me.connectsToday), note: me ? `${formatPercent(me.callsToday ? me.connectsToday / me.callsToday : 0)} connect rate` : undefined },
        { label: "Appointments", value: me && formatNumber(me.appointmentsToday) },
        { label: "Talk time", value: me && formatDuration(me.talkTimeSec) },
        { label: "Voicemails dropped", value: vm === undefined ? "–" : formatNumber(vm), note: "One click, then next lead" },
      ]}
      columns={5}
    />
  );
}
