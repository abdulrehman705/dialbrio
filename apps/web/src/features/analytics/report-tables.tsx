"use client";

import { Megaphone, UsersRound } from "lucide-react";
import type { Report } from "@dialbrio/types";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/states";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils";

type AgentRow = Report["agents"][number];
type CampaignRow = Report["campaigns"][number];

const num = (v: number) => <span className="text-fg">{formatNumber(v)}</span>;

const agentColumns: ColumnDef<AgentRow, any>[] = [
  {
    id: "rank",
    header: "#",
    enableSorting: false,
    cell: (c) => <span className="text-fg-muted tabular">{c.row.index + 1}</span>,
    size: 40,
  },
  {
    accessorKey: "name",
    header: "Agent",
    cell: (c) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={c.row.original.name} initials={c.row.original.initials} size="sm" />
        <span className="font-medium text-fg">{c.row.original.name}</span>
      </span>
    ),
  },
  { accessorKey: "calls", header: "Dials", meta: { align: "right" }, cell: (c) => num(c.getValue()) },
  { accessorKey: "connected", header: "Connected", meta: { align: "right", hideBelow: "lg" }, cell: (c) => formatNumber(c.getValue()) },
  {
    id: "connectRate",
    accessorFn: (r) => (r.calls ? r.connected / r.calls : 0),
    header: "Connect rate",
    meta: { align: "right" },
    cell: (c) => formatPercent(c.getValue()),
  },
  { accessorKey: "appointments", header: "Appts", meta: { align: "right" }, cell: (c) => num(c.getValue()) },
  {
    id: "apptRate",
    accessorFn: (r) => (r.connected ? r.appointments / r.connected : 0),
    header: "Appt rate",
    meta: { align: "right", hideBelow: "xl" },
    cell: (c) => formatPercent(c.getValue()),
  },
  { accessorKey: "talkTimeSec", header: "Talk time", meta: { align: "right", hideBelow: "lg" }, cell: (c) => formatDuration(c.getValue()) },
  { accessorKey: "idleSec", header: "Idle", meta: { align: "right", hideBelow: "xl" }, cell: (c) => formatDuration(c.getValue()) },
];

const campaignColumns: ColumnDef<CampaignRow, any>[] = [
  { accessorKey: "name", header: "Campaign", cell: (c) => <span className="font-medium text-fg">{c.getValue()}</span> },
  { accessorKey: "calls", header: "Dials", meta: { align: "right" }, cell: (c) => num(c.getValue()) },
  { accessorKey: "connectRate", header: "Connect rate", meta: { align: "right" }, cell: (c) => formatPercent(c.getValue()) },
  { accessorKey: "appointments", header: "Appts", meta: { align: "right" }, cell: (c) => num(c.getValue()) },
  { accessorKey: "appointmentRate", header: "Appt rate", meta: { align: "right", hideBelow: "lg" }, cell: (c) => formatPercent(c.getValue()) },
];

function agentCard(a: AgentRow) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={a.name} initials={a.initials} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-fg">{a.name}</p>
        <p className="text-xs text-fg-muted tabular">
          {formatNumber(a.calls)} dials · {formatPercent(a.calls ? a.connected / a.calls : 0)} connect · {a.appointments} appts
        </p>
      </div>
    </div>
  );
}

function campaignCard(c: CampaignRow) {
  return (
    <div>
      <p className="text-[13px] font-medium text-fg">{c.name}</p>
      <p className="text-xs text-fg-muted tabular">
        {formatNumber(c.calls)} calls · {formatPercent(c.connectRate)} connect · {c.appointments} appts ({formatPercent(c.appointmentRate)})
      </p>
    </div>
  );
}

export function AgentLeaderboard({ report, loading, title = "Agent leaderboard", description = "Ranked by appointments booked" }: { report?: Report; loading: boolean; title?: string; description?: string }) {
  const rows = [...(report?.agents ?? [])].sort((a, b) => b.appointments - a.appointments || b.connected - a.connected);
  return (
    <Card className="overflow-hidden">
      <CardHeader title={title} description={description} />
      <DataTable
        caption={title}
        data={rows}
        columns={agentColumns}
        getRowId={(r) => r.userId}
        loading={loading}
        mobileCard={agentCard}
        empty={<EmptyState compact icon={UsersRound} title="No agent activity" description="No calls were made in this range." />}
      />
    </Card>
  );
}

export function CampaignPerformance({ report, loading }: { report?: Report; loading: boolean }) {
  const rows = [...(report?.campaigns ?? [])].sort((a, b) => b.appointments - a.appointments);
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Which campaigns convert?" description="Connect and appointment rates by campaign" />
      <DataTable
        caption="Campaign performance"
        data={rows}
        columns={campaignColumns}
        getRowId={(r) => r.campaignId}
        loading={loading}
        mobileCard={campaignCard}
        empty={<EmptyState compact icon={Megaphone} title="No campaign activity" description="Launch a campaign to see performance." />}
      />
    </Card>
  );
}
