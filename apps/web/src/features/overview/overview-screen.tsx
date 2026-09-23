"use client";

import Link from "next/link";
import { useState } from "react";
import { PhoneCall } from "lucide-react";
import type { DateRange } from "@dialbrio/types";
import { Button } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { ErrorState } from "@/components/states";
import { useAgentActivity, useMe, useOverview } from "@/lib/queries";
import { useCan, useRole } from "@/lib/session";
import { AgentActivityPanel } from "./agent-activity";
import { AttentionPanel } from "./attention-panel";
import { KpiRow } from "./kpi-row";
import { PersonalKpis } from "./personal-kpis";
import { CallActivityCard, FunnelCard, LifecycleCard, NumberHealthCard, QueueHealthCard, RecentConversationsCard } from "./panels";

const RANGES: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

export function OverviewScreen() {
  const [range, setRange] = useState<DateRange>("today");
  const role = useRole();
  const team = useCan("analytics.team");
  const { data: me } = useMe();
  const overview = useOverview(range);
  const agents = useAgentActivity();
  const isAgent = role === "agent";
  const first = me?.user.name.split(" ")[0];

  const loading = overview.isLoading;
  const data = overview.data;

  return (
    <Page>
      <PageHeader
        title={isAgent ? `Good to see you${first ? `, ${first}` : ""}` : "Overview"}
        description={isAgent ? "Your activity today and conversations waiting on you." : "What's happening across calling, queues and numbers right now."}
        actions={
          <>
            {!isAgent && <Segmented label="Date range" value={range} onValueChange={setRange} options={RANGES} />}
            {isAgent && (
              <Button asChild variant="primary" size="lg">
                <Link href="/app/dialer">
                  <PhoneCall /> Start dialing
                </Link>
              </Button>
            )}
          </>
        }
      />

      {overview.isError ? (
        <ErrorState onRetry={() => void overview.refetch()} description="The overview could not be loaded. Calling is not affected." />
      ) : team === false || isAgent ? (
        <>
          <PersonalKpis me={agents.data?.find((a) => a.userId === me?.user.id)} loading={agents.isLoading || !me} />
          <div className="grid gap-4 xl:grid-cols-12 [&>*]:min-w-0">
            <RecentConversationsCard personal data={data} loading={loading} className="xl:col-span-8" />
            <LifecycleCard personal data={data} loading={loading} className="xl:col-span-4" />
          </div>
        </>
      ) : (
        <>
          <KpiRow data={data} range={range} loading={loading} />
          <div className="grid gap-4 xl:grid-cols-12 [&>*]:min-w-0">
            <AttentionPanel items={data?.attention} loading={loading} error={false} onRetry={() => void overview.refetch()} className="xl:col-span-4" />
            <AgentActivityPanel className="xl:col-span-8" />
          </div>
          <div className="grid gap-4 xl:grid-cols-12 [&>*]:min-w-0">
            <CallActivityCard data={data} loading={loading} className="xl:col-span-8" />
            <QueueHealthCard data={data} loading={loading} className="xl:col-span-4" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
            <LifecycleCard data={data} loading={loading} />
            <FunnelCard data={data} loading={loading} />
            <NumberHealthCard data={data} loading={loading} className="md:col-span-2 xl:col-span-1" />
          </div>
          <RecentConversationsCard data={data} loading={loading} />
        </>
      )}
    </Page>
  );
}
