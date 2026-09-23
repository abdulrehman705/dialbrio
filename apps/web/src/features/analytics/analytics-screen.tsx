"use client";

import { useState } from "react";
import type { ReportParams } from "@dialbrio/types";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { ErrorState } from "@/components/states";
import { useMe, useReport, useSubAccount } from "@/lib/queries";
import { useCan } from "@/lib/session";
import { KpiGrid } from "./kpi-grid";
import { ReportCharts } from "./report-charts";
import { ReportFilters } from "./report-filters";
import { AgentLeaderboard, CampaignPerformance } from "./report-tables";

export function AnalyticsScreen() {
  const sub = useSubAccount();
  const team = useCan("analytics.team");
  const { data: me } = useMe();
  const [params, setParams] = useState<ReportParams>({ range: "7d", scope: "subaccount", scopeId: sub });

  // Agents only ever see their own metrics; the API enforces the same scope.
  const personal = team === false;
  const effective: ReportParams = personal ? { range: params.range, scope: "agent", scopeId: me?.user.id } : params;
  const report = useReport(effective);
  const loading = report.isLoading || team === undefined;

  const data = report.data && personal ? { ...report.data, agents: report.data.agents.filter((a) => a.userId === me?.user.id) } : report.data;

  return (
    <Page>
      <PageHeader
        title="Analytics"
        description={personal ? "Your own dials, connects and bookings. Team numbers are visible to managers." : "What your dialing produced, and where the time went."}
        actions={
          personal && (
            <Segmented
              label="Date range"
              value={params.range}
              onValueChange={(range) => setParams({ ...params, range })}
              options={[
                { value: "today", label: "Today" },
                { value: "7d", label: "7d" },
                { value: "30d", label: "30d" },
                { value: "90d", label: "90d" },
              ]}
            />
          )
        }

      />

      {personal ? null : (
        <ReportFilters params={params} onChange={setParams} />
      )}

      {report.isError ? (
        <ErrorState onRetry={() => void report.refetch()} description="The report could not be generated. Try again or choose a smaller date range." />
      ) : (
        <div className={report.isFetching && !loading ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={report.isFetching}>
          <div className="flex flex-col gap-6">
            <KpiGrid report={data} range={effective.range} loading={loading} />
            <ReportCharts report={data} range={effective.range} loading={loading} />
            {personal ? (
              <AgentLeaderboard report={data} loading={loading} title="Your totals" description="Calls, connects and appointments in this range" />
            ) : (
              <div className="grid gap-4 2xl:grid-cols-2">
                <AgentLeaderboard report={data} loading={loading} />
                <CampaignPerformance report={data} loading={loading} />
              </div>
            )}
          </div>
        </div>
      )}
    </Page>
  );
}
