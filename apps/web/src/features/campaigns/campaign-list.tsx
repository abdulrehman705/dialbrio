"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Ellipsis, Eye, Megaphone, Archive, Pause, Play, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { Campaign, CampaignStatus as CampaignStatusT } from "@dialbrio/types";
import { useAgentActivity, useCampaigns, useSetCampaignStatus } from "@/lib/queries";
import { useCan } from "@/lib/session";
import { CampaignStatus } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState, ErrorState } from "@/components/states";
import { formatNumber, formatPercent, formatPhone } from "@/lib/utils";
import { CampaignDetail } from "./campaign-detail";
import { AgentStack, connectRate, conversion, StrategyBadge } from "./shared";

type Filter = "all" | CampaignStatusT;

export function CampaignList() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("id");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [q, setQ] = React.useState("");
  const { data, isLoading, isError, refetch } = useCampaigns();
  const agents = useAgentActivity();
  const canManage = useCan("campaigns.manage");

  const open = (id: string | null) => router.replace(id ? `/app/campaigns?id=${id}` : "/app/campaigns", { scroll: false });

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: data?.length ?? 0 };
    data?.forEach((x) => (c[x.status] = (c[x.status] ?? 0) + 1));
    return c;
  }, [data]);

  const rows = React.useMemo(
    () => (data ?? []).filter((c) => (filter === "all" || c.status === filter) && (!q || c.name.toLowerCase().includes(q.toLowerCase()))),
    [data, filter, q],
  );

  const columns = React.useMemo<ColumnDef<Campaign>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="min-w-0 max-w-72">
            <p className="flex items-center gap-2 font-medium text-fg">
              <span className="truncate">{row.original.name}</span>
              {row.original.dialStrategy === "ai" && <StrategyBadge strategy="ai" size="sm" />}
            </p>
            <p className="truncate text-xs text-fg-muted">{row.original.leadSource}</p>
          </div>
        ),
      },
      { id: "status", accessorKey: "status", header: "Status", cell: ({ row }) => <CampaignStatus status={row.original.status} size="sm" /> },
      { id: "queue", accessorKey: "queueName", header: "Queue", cell: ({ getValue }) => <span className="text-fg-secondary">{getValue<string>()}</span>, meta: { className: "max-2xl:hidden" } },
      { id: "leads", accessorKey: "leads", header: "Leads", cell: ({ getValue }) => formatNumber(getValue<number>()), meta: { align: "right" } },
      { id: "attempts", accessorKey: "attempts", header: "Attempts", cell: ({ getValue }) => formatNumber(getValue<number>()), meta: { align: "right", className: "max-2xl:hidden" } },
      {
        id: "connected",
        accessorKey: "connected",
        header: "Connected",
        meta: { align: "right" },
        cell: ({ row }) => (
          <span>
            {formatNumber(row.original.connected)}
            <span className="ml-1.5 text-xs text-fg-muted">{row.original.attempts ? formatPercent(connectRate(row.original), 0) : "—"}</span>
          </span>
        ),
      },
      { id: "appointments", accessorKey: "appointments", header: "Appts", cell: ({ getValue }) => formatNumber(getValue<number>()), meta: { align: "right" } },
      {
        id: "conversion",
        accessorFn: conversion,
        header: "Conversion",
        cell: ({ row }) => (row.original.leads ? formatPercent(conversion(row.original)) : <span className="text-fg-muted">—</span>),
        meta: { align: "right", hideBelow: "lg" },
      },
      { id: "agents", header: "Agents", enableSorting: false, cell: ({ row }) => <AgentStack ids={row.original.agentIds} agents={agents.data} />, meta: { hideBelow: "lg" } },
      {
        id: "callerIds",
        header: "Caller IDs",
        enableSorting: false,
        meta: { hideBelow: "xl" },
        cell: ({ row }) =>
          row.original.callerIds.length ? (
            <span className="font-mono text-xs" title={row.original.callerIds.map(formatPhone).join(", ")}>
              {formatPhone(row.original.callerIds[0]!)}
              {row.original.callerIds.length > 1 && <span className="ml-1 font-sans text-fg-muted">+{row.original.callerIds.length - 1}</span>}
            </span>
          ) : (
            <span className="text-xs text-fg-muted">None</span>
          ),
      },
      { id: "actions", header: () => <span className="sr-only">Actions</span>, enableSorting: false, cell: ({ row }) => <RowActions campaign={row.original} canManage={!!canManage} onView={() => open(row.original.id)} />, meta: { align: "right" } },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agents.data, canManage],
  );

  return (
    <Page>
      <PageHeader
        title="Campaigns"
        description="Each campaign decides which leads get called, from which numbers, and what happens when nobody answers."
        actions={
          canManage && (
            <Button asChild variant="primary">
              <Link href="/app/campaigns/new">
                <Plus /> New campaign
              </Link>
            </Button>
          )
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-3 overflow-x-auto px-3 md:mx-0 md:px-0">
            <Segmented<Filter>
              label="Filter by status"
              value={filter}
              onValueChange={setFilter}
              options={(["all", "active", "paused", "draft", "completed"] as Filter[]).map((f) => ({
                value: f,
                label: (
                  <>
                    {f === "all" ? "All" : f[0]!.toUpperCase() + f.slice(1)}
                    <span className="text-fg-muted tabular">{counts[f] ?? 0}</span>
                  </>
                ),
              }))}
            />
          </div>
          <Input
            leadingIcon={<Search />}
            placeholder="Search campaigns"
            aria-label="Search campaigns"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="md:w-64"
          />
        </div>
        {isError ? (
          <ErrorState onRetry={() => void refetch()} description="Campaigns could not be loaded." />
        ) : (
          <DataTable
            caption="Campaigns"
            data={rows}
            columns={columns}
            loading={isLoading}
            getRowId={(c) => c.id}
            onRowClick={(c) => open(c.id)}
            selectedRowId={selectedId ?? undefined}
            mobileCard={(c) => <CampaignCard campaign={c} agents={agents.data} />}
            empty={
              data?.length ? (
                <EmptyState
                  icon={Search}
                  title="No campaigns match"
                  description="Try a different status or search term."
                  action={
                    <Button
                      size="sm"
                      onClick={() => {
                        setFilter("all");
                        setQ("");
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Megaphone}
                  title="No campaigns yet"
                  description="A campaign decides which leads get called, from which queue, with which caller IDs and rules."
                  action={
                    canManage && (
                      <Button asChild variant="primary" size="sm">
                        <Link href="/app/campaigns/new">
                          <Plus /> Create your first campaign
                        </Link>
                      </Button>
                    )
                  }
                />
              )
            }
          />
        )}
      </Card>

      <CampaignDetail campaign={data?.find((c) => c.id === selectedId)} loading={isLoading && !!selectedId} open={!!selectedId} onOpenChange={(o) => !o && open(null)} />
    </Page>
  );
}

function CampaignCard({ campaign: c, agents }: { campaign: Campaign; agents?: Parameters<typeof AgentStack>[0]["agents"] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-fg">{c.name}</p>
          <p className="truncate text-xs text-fg-muted">
            {c.queueName} · {c.leadSource}
          </p>
        </div>
        <CampaignStatus status={c.status} size="sm" />
      </div>
      <dl className="grid grid-cols-4 gap-2 text-xs">
        {[
          ["Leads", formatNumber(c.leads)],
          ["Connected", c.attempts ? formatPercent(connectRate(c), 0) : "—"],
          ["Appts", formatNumber(c.appointments)],
          ["Conv.", c.leads ? formatPercent(conversion(c)) : "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-fg-muted">{k}</dt>
            <dd className="font-medium text-fg tabular">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center gap-2">
        <StrategyBadge strategy={c.dialStrategy} size="sm" />
        <AgentStack ids={c.agentIds} agents={agents} />
      </div>
    </div>
  );
}

function RowActions({ campaign: c, canManage, onView }: { campaign: Campaign; canManage: boolean; onView: () => void }) {
  const setStatus = useSetCampaignStatus();
  const change = (status: "active" | "paused") =>
    setStatus.mutate(
      { id: c.id, status },
      {
        onSuccess: () =>
          toast.success(status === "paused" ? `${c.name} paused` : `${c.name} resumed`, {
            description: status === "paused" ? "No new calls will be placed. Calls in progress finish normally." : "Leads from this campaign are eligible for dialing again.",
          }),
        onError: () => toast.error("Couldn't change campaign status"),
      },
    );

  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.name}`}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onView}>
            <Eye /> View details
          </DropdownMenuItem>
          {canManage && (
            <>
              {c.status === "active" && (
                <DropdownMenuItem onSelect={() => change("paused")}>
                  <Pause /> Pause campaign
                </DropdownMenuItem>
              )}
              {c.status === "paused" && (
                <DropdownMenuItem onSelect={() => change("active")}>
                  <Play /> Resume campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Copy /> Duplicate <span className="ml-auto text-[11px] text-fg-muted">Phase 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Archive /> Archive <span className="ml-auto text-[11px] text-fg-muted">Phase 2</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
