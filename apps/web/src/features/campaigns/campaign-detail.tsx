"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ListOrdered, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import type { Campaign } from "@dialbrio/types";
import { useAgentActivity, useSetCampaignStatus } from "@/lib/queries";
import { useCan } from "@/lib/session";
import { AgentStatus, CampaignStatus } from "@/components/domain";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states";
import { Megaphone } from "lucide-react";
import { formatNumber, formatPercent, formatPhone } from "@/lib/utils";
import { connectRate, conversion, StrategyBadge } from "./shared";
import { DIAL_MODE_LABEL } from "./schema";

export function CampaignDetail({ campaign: c, loading, open, onOpenChange }: { campaign?: Campaign; loading: boolean; open: boolean; onOpenChange: (o: boolean) => void }) {
  const agents = useAgentActivity();
  const canManage = useCan("campaigns.manage");
  const setStatus = useSetCampaignStatus();

  const toggle = (status: "active" | "paused") =>
    c &&
    setStatus.mutate(
      { id: c.id, status },
      {
        onSuccess: () => toast.success(status === "paused" ? `${c.name} paused` : `${c.name} resumed`),
        onError: () => toast.error("Couldn't change campaign status"),
      },
    );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={c?.name ?? "Campaign"}
        header={
          c ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-fg">{c.name}</h2>
                <CampaignStatus status={c.status} size="sm" />
              </div>
              <p className="mt-0.5 text-[13px] text-fg-muted">Created {format(new Date(c.createdAt), "MMM d, yyyy")}, leads from {c.leadSource}</p>
            </div>
          ) : undefined
        }
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!c ? (
            loading ? (
              <div className="space-y-4 p-5">
                <Skeleton className="h-20" />
                <Skeleton className="h-40" />
              </div>
            ) : (
              <EmptyState icon={Megaphone} title="Campaign not found" description="It may have been removed, or it belongs to another sub-account." />
            )
          ) : (
            <div className="space-y-6 p-5">
              <section aria-label="Results" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
                {[
                  ["Leads", formatNumber(c.leads)],
                  ["Attempts", formatNumber(c.attempts)],
                  ["Connected", c.attempts ? `${formatNumber(c.connected)} (${formatPercent(connectRate(c), 0)})` : "–"],
                  ["Appointments", formatNumber(c.appointments)],
                  ["Conversion", c.leads ? formatPercent(conversion(c)) : "–"],
                  ["Dial mode", DIAL_MODE_LABEL[c.dialMode]],
                ].map(([k, v]) => (
                  <div key={k} className="bg-surface p-3">
                    <p className="text-xs text-fg-muted">{k}</p>
                    <p className="mt-0.5 font-display text-lg font-bold tracking-[-0.02em] text-fg">{v}</p>
                  </div>
                ))}
              </section>


              <section>
                <h3 className="text-[13px] font-semibold text-fg">Configuration</h3>
                <dl className="mt-2 divide-y divide-border rounded-lg border border-border text-[13px]">
                  <Row k="Dial strategy" v={<StrategyBadge strategy={c.dialStrategy} size="sm" />} />
                  <Row
                    k="Queue"
                    v={
                      <Link href={`/app/queue?queue=${c.queueId}`} className="inline-flex items-center gap-1.5 text-brand-text hover:underline">
                        {c.queueName}
                      </Link>
                    }
                  />
                  <Row k="Lead source" v={c.leadSource} />
                  <Row
                    k="Caller IDs"
                    v={
                      c.callerIds.length ? (
                        <span className="flex flex-wrap justify-end gap-x-3 gap-y-1 font-mono text-xs">
                          {c.callerIds.map((n) => (
                            <span key={n}>{formatPhone(n)}</span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-fg-muted">None assigned</span>
                      )
                    }
                  />
                </dl>
              </section>

              <section>
                <h3 className="text-[13px] font-semibold text-fg">Agents ({c.agentIds.length})</h3>
                {c.agentIds.length === 0 ? (
                  <p className="mt-2 text-[13px] text-fg-muted">{c.dialStrategy === "ai" ? "AI voice campaigns hand off to agents on request; none assigned yet." : "No agents assigned."}</p>
                ) : (
                  <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                    {c.agentIds.map((id) => {
                      const a = agents.data?.find((x) => x.userId === id);
                      return (
                        <li key={id} className="flex items-center gap-3 px-3 py-2">
                          {a ? (
                            <>
                              <Avatar name={a.name} initials={a.initials} size="sm" />
                              <span className="flex-1 text-[13px] text-fg">{a.name}</span>
                              <AgentStatus status={a.status} size="sm" />
                            </>
                          ) : (
                            <Skeleton className="h-6 w-full" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
        {c && canManage && (c.status === "active" || c.status === "paused") && (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
            {c.status === "active" ? (
              <Button onClick={() => toggle("paused")} loading={setStatus.isPending}>
                <Pause /> Pause campaign
              </Button>
            ) : (
              <Button variant="primary" onClick={() => toggle("active")} loading={setStatus.isPending}>
                <Play /> Resume campaign
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <dt className="shrink-0 text-fg-muted">{k}</dt>
      <dd className="min-w-0 text-right text-fg">{v}</dd>
    </div>
  );
}
