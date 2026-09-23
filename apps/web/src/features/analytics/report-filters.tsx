"use client";

import type { DateRange, ReportParams } from "@dialbrio/types";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import { useAgentActivity, useCampaigns, useMe, usePhoneNumbers, useSubAccount } from "@/lib/queries";
import { formatPhone } from "@/lib/utils";

type Scope = ReportParams["scope"];

const SCOPES: { value: Scope; label: string }[] = [
  { value: "organization", label: "Organization" },
  { value: "subaccount", label: "Sub-account" },
  { value: "team", label: "Team" },
  { value: "agent", label: "Agent" },
  { value: "campaign", label: "Campaign" },
  { value: "number", label: "Phone number" },
];

const RANGES: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

interface Props {
  params: ReportParams;
  onChange: (p: ReportParams) => void;
}

/** Filters live in one row above the charts (dataviz interaction rule). */
export function ReportFilters({ params, onChange }: Props) {
  const { data: me } = useMe();
  const sub = useSubAccount();
  const agents = useAgentActivity();
  const campaigns = useCampaigns();
  const numbers = usePhoneNumbers();

  const entityOptions: { value: string; label: string }[] | null =
    params.scope === "agent"
      ? (agents.data ?? []).map((a) => ({ value: a.userId, label: a.name }))
      : params.scope === "campaign"
        ? (campaigns.data ?? []).filter((c) => c.attempts > 0).map((c) => ({ value: c.id, label: c.name }))
        : params.scope === "number"
          ? (numbers.data ?? []).map((n) => ({ value: n.id, label: `${formatPhone(n.number)} · ${n.friendlyName}` }))
          : params.scope === "subaccount"
            ? (me?.subAccounts ?? []).filter((s) => s.id === sub).map((s) => ({ value: s.id, label: s.name }))
            : null;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center" role="group" aria-label="Report filters">
      <div className="w-full md:w-44">
        <Select
          aria-label="Report scope"
          value={params.scope}
          onValueChange={(v) => {
            const scope = v as Scope;
            onChange({ ...params, scope, scopeId: scope === "subaccount" ? sub : undefined });
          }}
          options={SCOPES}
          size="sm"
        />
      </div>
      {params.scope === "team" ? (
        <p className="text-xs text-fg-muted md:px-1">Team filters arrive with Teams in Phase 1 — showing all agents.</p>
      ) : params.scope === "organization" ? (
        <p className="text-xs text-fg-muted md:px-1">All sub-accounts in {me?.organization.name ?? "your organization"}</p>
      ) : (
        entityOptions && (
          <div className="w-full md:w-64">
            <Select
              aria-label={`Select ${params.scope}`}
              placeholder={`All ${params.scope === "number" ? "numbers" : params.scope + "s"}`}
              value={params.scopeId}
              onValueChange={(v) => onChange({ ...params, scopeId: v })}
              options={entityOptions}
              size="sm"
            />
          </div>
        )
      )}
      <Segmented className="md:ml-auto" label="Date range" value={params.range} onValueChange={(range) => onChange({ ...params, range })} options={RANGES} />
    </div>
  );
}
