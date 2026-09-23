"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Ear, Headphones, Mic, PhoneIncoming } from "lucide-react";
import type { AgentActivity as AgentActivityT, AgentStatus as AgentStatusT } from "@dialbrio/types";
import { AGENT_STATUS_META } from "@/components/domain";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot } from "@/components/ui/status-dot";
import { EmptyState, ErrorState } from "@/components/states";
import { qk, useAgentActivity, useSubAccount } from "@/lib/queries";
import { useRealtimeEvent } from "@/lib/realtime/hooks";
import { cn, formatNumber } from "@/lib/utils";
import { formatMinutes, minutesSince, useNow } from "./use-now";

const ORDER: Record<AgentStatusT, number> = { on_call: 0, wrap_up: 1, available: 2, break: 3, offline: 4 };

/** Listen / whisper / barge. Real-time monitoring needs Twilio conference legs (Phase 3), so items are disabled. */
function MonitorMenu({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="xs" aria-label={`Monitor ${name}'s call`}>
          Monitor <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuItem disabled>
          <Ear /> Listen
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Mic /> Whisper to rep
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <PhoneIncoming /> Barge in
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <p className="px-2 pt-1 pb-1.5 text-xs leading-4 text-fg-muted">Live monitoring arrives with Twilio voice in Phase 3.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AgentActivityPanel({ className }: { className?: string }) {
  const { data, isLoading, isError, refetch } = useAgentActivity();
  const qc = useQueryClient();
  const sub = useSubAccount();
  const now = useNow();

  // Live status updates patch the cache in place (SSE in production).
  useRealtimeEvent("agent.status_changed", (e) => {
    qc.setQueryData<AgentActivityT[]>(qk.agents(sub), (prev) => prev?.map((a) => (a.userId === e.userId ? { ...a, status: e.status, statusSince: new Date().toISOString() } : a)));
  });

  const rows = [...(data ?? [])].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const working = rows.filter((a) => a.status !== "offline");
  const dialsPerRep = working.length ? Math.round(working.reduce((s, a) => s + a.callsToday, 0) / working.length) : 0;
  const onCall = rows.filter((a) => a.status === "on_call").length;
  const available = rows.filter((a) => a.status === "available").length;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        title="Agents right now"
        description={data ? `${onCall} on a call, ${available} waiting for a lead, ${formatNumber(dialsPerRep)} dials per rep today` : "Who is dialing right now"}
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
            <StatusDot tone="success" live /> Live
          </span>
        }
      />
      {isLoading ? (
        <div className="space-y-2 px-5 pb-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState compact onRetry={() => void refetch()} description="Agent activity could not be loaded." />
      ) : rows.length === 0 ? (
        <EmptyState compact icon={Headphones} title="No agents in this sub-account" description="Invite agents from Team to start dialing." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <caption className="sr-only">Agent status and today's activity</caption>
            <thead>
              <tr className="border-y border-border text-xs text-fg-muted">
                <th scope="col" className="h-8 px-5 text-left font-normal">Agent</th>
                <th scope="col" className="px-3 text-left font-normal">Status</th>
                <th scope="col" className="px-3 text-left font-normal max-md:hidden">Working on</th>
                <th scope="col" className="px-3 text-right font-normal">Dials</th>
                <th scope="col" className="px-3 text-right font-normal max-sm:hidden xl:max-2xl:hidden">Connects</th>
                <th scope="col" className="px-3 text-right font-normal max-sm:hidden">Booked</th>
                <th scope="col" className="w-24 px-4 max-lg:hidden">
                  <span className="sr-only">Monitor</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const meta = AGENT_STATUS_META[a.status];
                return (
                  <tr key={a.userId} className={cn("border-b border-border last:border-0", a.status === "offline" && "text-fg-muted")}>
                    <td className="h-12 px-5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.name} initials={a.initials} size="sm" />
                        <span className={cn("truncate font-medium", a.status === "offline" ? "text-fg-muted" : "text-fg")}>{a.name}</span>
                      </div>
                    </td>
                    <td className="px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        {meta.dot && <StatusDot tone={meta.dot} live={meta.live} size="md" />}
                        <span className="text-fg-secondary">{meta.label}</span>
                        <span className="font-mono text-[11px] text-fg-muted">{formatMinutes(minutesSince(a.statusSince, now))}</span>
                      </span>
                    </td>
                    <td className="max-w-56 px-3 max-md:hidden">
                      {a.currentContact && <p className="truncate text-fg">{a.currentContact}</p>}
                      {a.campaignName ? <p className={cn("truncate", a.currentContact ? "text-xs text-fg-muted" : "text-fg-secondary")}>{a.campaignName}</p> : <p className="text-fg-muted">–</p>}
                    </td>
                    <td className="px-3 text-right font-mono text-fg">{formatNumber(a.callsToday)}</td>
                    <td className="px-3 text-right font-mono text-fg-secondary max-sm:hidden xl:max-2xl:hidden">{formatNumber(a.connectsToday)}</td>
                    <td className="px-3 text-right font-mono text-fg-secondary max-sm:hidden">{formatNumber(a.appointmentsToday)}</td>
                    <td className="px-4 text-right max-lg:hidden">{a.status === "on_call" && <MonitorMenu name={a.name} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
