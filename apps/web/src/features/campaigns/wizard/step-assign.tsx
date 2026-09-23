"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Hash, TriangleAlert, Users } from "lucide-react";
import { AgentStatus, ComplianceStatus, NumberHealth } from "@/components/domain";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { useAgentActivity, usePhoneNumbers } from "@/lib/queries";
import { cn, formatPercent, formatPhone } from "@/lib/utils";
import { ROTATIONS, type CampaignFormValues } from "../schema";
import { ChoiceCard, FieldError, Section, StepHeader } from "./controls";

export function StepNumbers() {
  const { control, formState, watch } = useFormContext<CampaignFormValues>();
  const numbers = usePhoneNumbers();
  const selected = watch("callerIds");
  const voice = (numbers.data ?? []).filter((n) => n.capabilities.includes("voice") && n.status !== "released");
  const risky = voice.filter((n) => selected.includes(n.number) && (n.health === "at_risk" || n.health === "watch"));

  return (
    <>
      <StepHeader title="Numbers" description="Caller IDs this campaign dials from. Healthy numbers get answered more." />
      <div className="space-y-7">
        <Section title="Caller IDs">
          {numbers.isError ? (
            <ErrorState compact onRetry={() => void numbers.refetch()} />
          ) : numbers.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : voice.length === 0 ? (
            <EmptyState compact icon={Hash} title="No voice numbers" description="Connect Twilio and add a number before launching a campaign." />
          ) : (
            <Controller
              control={control}
              name="callerIds"
              render={({ field }) => (
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border" aria-label="Available numbers">
                  {voice.map((n) => {
                    const unavailable = n.status !== "active";
                    const on = field.value.includes(n.number);
                    const id = `num-${n.id}`;
                    return (
                      <li key={n.id} className={cn("flex items-center gap-3 px-3 py-2.5", on && "bg-brand-soft", unavailable && "opacity-60")}>
                        <Checkbox
                          id={id}
                          checked={on}
                          disabled={unavailable}
                          onCheckedChange={(v) => field.onChange(v ? [...field.value, n.number] : field.value.filter((x) => x !== n.number))}
                        />
                        <label htmlFor={id} className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1", !unavailable && "cursor-pointer")}>
                          <span className="font-mono text-[13px] text-fg">{formatPhone(n.number)}</span>
                          <span className="truncate text-xs text-fg-muted">
                            {n.friendlyName}
                            {n.campaignName ? ` · ${n.campaignName}` : ""}
                          </span>
                          {unavailable && <span className="text-xs text-fg-muted">Paused while cooling down</span>}
                        </label>
                        <span className="hidden text-xs text-fg-muted tabular sm:inline" title="Answer rate">
                          {formatPercent(n.answerRate, 0)} answer
                        </span>
                        <span className="hidden md:inline">
                          <ComplianceStatus status={n.a2p} size="sm" label={`A2P ${n.a2p === "approved" ? "approved" : "pending"}`} />
                        </span>
                        <NumberHealth health={n.health} size="sm" />
                      </li>
                    );
                  })}
                </ul>
              )}
            />
          )}
          <FieldError message={formState.errors.callerIds?.message} />
          {risky.length > 0 && (
            <div role="status" className="flex gap-2.5 rounded-lg border border-border bg-warning-soft p-3 text-[13px] text-warning-text">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">
                  {risky.length === 1 ? `${formatPhone(risky[0]!.number)} has` : `${risky.length} selected numbers have`} health warnings
                </p>
                <p className="mt-0.5 text-xs leading-5">
                  {risky.some((n) => n.health === "at_risk")
                    ? "At-risk numbers are labeled as spam by at least one carrier and get far fewer answers. Consider removing them."
                    : "Watch numbers show early spam signals. DialBrio will rotate them out automatically if they worsen."}
                </p>
              </div>
            </div>
          )}
        </Section>

        <Section title="Rotation">
          <Controller
            control={control}
            name="numberRotation"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Number rotation" className="grid gap-3 md:grid-cols-3">
                {ROTATIONS.map((r) => (
                  <ChoiceCard key={r.value} selected={field.value === r.value} onSelect={() => field.onChange(r.value)} title={r.label} description={r.description} />
                ))}
              </div>
            )}
          />
        </Section>
      </div>
    </>
  );
}

export function StepAgents() {
  const { control, formState, watch } = useFormContext<CampaignFormValues>();
  const agents = useAgentActivity();
  const ai = watch("dialStrategy") === "ai";

  return (
    <>
      <StepHeader
        title="Agents"
        description={ai ? "AI voice calls hand off to these agents when a lead asks for a person. Optional for AI campaigns." : "Agents who receive leads from this campaign in their dialer."}
      />
      {agents.isError ? (
        <ErrorState compact onRetry={() => void agents.refetch()} />
      ) : agents.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : !agents.data?.length ? (
        <EmptyState compact icon={Users} title="No agents in this sub-account" description="Invite agents from Team before assigning them." />
      ) : (
        <Controller
          control={control}
          name="agentIds"
          render={({ field }) => {
            const all = agents.data!.map((a) => a.userId);
            const allOn = all.every((id) => field.value.includes(id));
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-fg-muted tabular">
                    {field.value.length} of {all.length} selected
                  </p>
                  <Button type="button" size="sm" variant="ghost" onClick={() => field.onChange(allOn ? [] : all)}>
                    {allOn ? "Clear all" : "Select all"}
                  </Button>
                </div>
                <ul className="grid gap-2 md:grid-cols-2" aria-label="Agents">
                  {agents.data!.map((a) => {
                    const on = field.value.includes(a.userId);
                    const id = `agent-${a.userId}`;
                    return (
                      <li key={a.userId}>
                        <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors", on ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-hover")}>
                          <Checkbox id={id} checked={on} onCheckedChange={(v) => field.onChange(v ? [...field.value, a.userId] : field.value.filter((x) => x !== a.userId))} />
                          <Avatar name={a.name} initials={a.initials} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-fg">{a.name}</span>
                            <span className="block truncate text-xs text-fg-muted">{a.campaignName ? `Now on ${a.campaignName}` : "No active campaign"}</span>
                          </span>
                          <AgentStatus status={a.status} size="sm" />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }}
        />
      )}
      <div className="mt-3">
        <FieldError message={formState.errors.agentIds?.message} />
      </div>
    </>
  );
}
