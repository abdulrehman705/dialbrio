"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Zap } from "lucide-react";
import { LEAD_STATES } from "@dialbrio/types";
import { LEAD_STATE_META } from "@/components/domain";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox, Switch } from "@/components/ui/switch";
import { useQueues } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { DIAL_MODES, LEAD_SOURCE_OPTIONS, LEAD_SOURCE_TYPES, specChip, type CampaignFormValues } from "../schema";
import { Chip, ChoiceCard, FieldError, Section, StepHeader } from "./controls";

export function StepBasics() {
  const { register, control, formState, watch } = useFormContext<CampaignFormValues>();
  const e = formState.errors;
  const desc = watch("description") ?? "";
  const mode = watch("dialMode");
  return (
    <>
      <StepHeader title="Basics" description="Name the campaign and decide how its calls get placed." />
      <div className="space-y-8">
        <div className="grid gap-4">
          <Field label="Campaign name" htmlFor="name" error={e.name?.message} hint="Reps see this at the top of the dialer.">
            <Input id="name" placeholder="e.g. Solar inbound, web leads" autoFocus aria-invalid={!!e.name} aria-describedby="name-desc" {...register("name")} />
          </Field>
          <Field label="Description" htmlFor="description" optional error={e.description?.message} hint={`${desc.length}/280`}>
            <Textarea id="description" rows={2} placeholder="Who this campaign calls and what a good outcome looks like" aria-describedby="description-desc" {...register("description")} />
          </Field>
        </div>

        <Section title="Who makes the calls" description="Either way the campaign uses the same queue, lifecycle states, dispositions, compliance checks and reports.">
          <Controller
            control={control}
            name="dialStrategy"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Dial strategy" className="grid gap-3 md:grid-cols-2">
                <ChoiceCard
                  selected={field.value === "human"}
                  onSelect={() => field.onChange("human")}
                  title="Your reps"
                  description="Reps dial from the DialBrio workspace with the script, notes and one-key outcomes."
                />
                <ChoiceCard
                  selected={field.value === "ai"}
                  onSelect={() => field.onChange("ai")}
                  title="AI voice agent"
                  badge={<span className="font-mono text-[11px] text-ai-text">Phase 6</span>}
                  description="Qualifies and books, then hands serious leads to a rep. You can save it as a draft today; launching comes with Phase 6."
                />
              </div>
            )}
          />
        </Section>

        <Section title="Dial mode">
          <Controller
            control={control}
            name="dialMode"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Dial mode" className="grid gap-3 md:grid-cols-3">
                {DIAL_MODES.map((m) => (
                  <ChoiceCard key={m.value} selected={field.value === m.value} onSelect={() => field.onChange(m.value)} title={m.label} description={m.description}>
                    <span className={cn(specChip, "mt-2.5", field.value === m.value && "bg-surface")}>{m.spec}</span>
                  </ChoiceCard>
                ))}
              </div>
            )}
          />
          {mode === "parallel" && (
            <div className="grid gap-5 rounded-lg border border-border bg-surface-sunken p-4 md:grid-cols-[auto_1fr]">
              <div>
                <p className="text-[13px] font-medium text-fg">Lines per rep</p>
                <p className="mt-0.5 text-xs text-fg-muted">Reps can lower this during a session.</p>
                <Controller
                  control={control}
                  name="lines"
                  render={({ field }) => (
                    <div role="radiogroup" aria-label="Parallel lines" className="mt-2 inline-flex rounded-md border border-border-strong bg-surface p-0.5">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={field.value === n}
                          onClick={() => field.onChange(n)}
                          className={cn("h-8 w-10 rounded-[5px] font-mono text-sm max-lg:h-11 max-lg:w-12", field.value === n ? "bg-fg text-fg-inverse" : "text-fg-secondary hover:bg-surface-hover")}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
              <div className="border-warning/40 rounded-md border bg-warning-soft px-3.5 py-3 text-xs leading-5 text-fg-secondary">
                <p className="font-medium text-warning-text">Parallel dialing has extra rules</p>
                <p className="mt-1">
                  Only dial leads who gave consent to be called with an automated dialer. DialBrio keeps the abandon rate under 3% per campaign over 30 days by pacing lines down, and plays a
                  recorded message to anyone who answers when no rep is free.
                </p>
                <Controller
                  control={control}
                  name="parallelAck"
                  render={({ field }) => (
                    <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-fg">
                      <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} aria-invalid={!!e.parallelAck} className="mt-0.5" />
                      <span>These leads have consent on file for dialer calls.</span>
                    </label>
                  )}
                />
                <FieldError message={e.parallelAck?.message} />
              </div>
            </div>
          )}
        </Section>
      </div>
    </>
  );
}

export function StepLeadSource() {
  const { control, formState, watch, setValue } = useFormContext<CampaignFormValues>();
  const type = watch("leadSource.type");
  const e = formState.errors.leadSource;
  return (
    <>
      <StepHeader title="Lead source" description="Leads enter this campaign automatically from GoHighLevel. GHL stays the system of record for contact data." />
      <div className="space-y-7">
        <Section title="Source type">
          <Controller
            control={control}
            name="leadSource.type"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Lead source type" className="grid gap-3 md:grid-cols-2">
                {LEAD_SOURCE_TYPES.map((t) => (
                  <ChoiceCard
                    key={t.value}
                    selected={field.value === t.value}
                    onSelect={() => {
                      field.onChange(t.value);
                      setValue("leadSource.value", "", { shouldDirty: true });
                    }}
                    title={t.label}
                    description={t.description}
                    disabled={t.value === "csv"}
                    badge={t.value === "csv" ? <span className="font-mono text-[11px] text-fg-muted">Phase 2</span> : undefined}
                  />
                ))}
              </div>
            )}
          />
        </Section>
        <Field
          label={type === "ghl_tag" ? "Tag" : type === "ghl_pipeline" ? "Pipeline stage" : "Smart list"}
          htmlFor="leadSource-value"
          error={e?.value?.message}
          hint="Options come from your connected GoHighLevel location. New matching contacts are added within seconds via webhook."
          className="max-w-md"
        >
          <Controller
            control={control}
            name="leadSource.value"
            render={({ field }) => (
              <Select
                id="leadSource-value"
                value={field.value || undefined}
                onValueChange={field.onChange}
                placeholder="Choose…"
                aria-invalid={!!e?.value}
                options={LEAD_SOURCE_OPTIONS[type].map((v) => ({ value: v, label: v }))}
              />
            )}
          />
        </Field>
        <Controller
          control={control}
          name="speedToLead"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div className="flex gap-3">
                <Zap className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <div>
                  <p className="text-[13px] font-medium text-fg">Speed-to-lead dialing</p>
                  <p className="mt-0.5 max-w-lg text-xs leading-5 text-fg-muted">
                    When a new lead arrives, ring the assigned rep and dial it within about 10 seconds, while they are still on the thank-you page. It jumps ahead of everything except due callbacks.
                  </p>
                  <span className={cn(specChip, "mt-2")}>trigger → ring in &lt;10s</span>
                </div>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Speed-to-lead dialing" />
            </div>
          )}
        />
        <p className="text-xs leading-5 text-fg-muted">
          Contacts are matched on phone number and CRM ID before they enter the campaign, so a lead is never queued twice, even when GoHighLevel sends the same webhook again.
        </p>
      </div>
    </>
  );
}

export function StepQueue() {
  const { control, formState, watch } = useFormContext<CampaignFormValues>();
  const queues = useQueues();
  const priority = watch("queuePriority");
  const states = watch("leadStates");
  const e = formState.errors;
  const ordered = [...(queues.data ?? [])].sort((a, b) => a.priority - b.priority);

  return (
    <>
      <StepHeader title="Queue & priority" description="Pick which lifecycle states this campaign dials and where it sits against your other queues." />
      <div className="space-y-7">
        <Section title="Lifecycle states" description="Leads move between states automatically. Only leads currently in a selected state are dialed.">
          <Controller
            control={control}
            name="leadStates"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Lifecycle states">
                {LEAD_STATES.map((s) => {
                  const Icon = LEAD_STATE_META[s].icon!;
                  const on = field.value.includes(s);
                  return (
                    <Chip key={s} selected={on} onToggle={() => field.onChange(on ? field.value.filter((x) => x !== s) : [...field.value, s])}>
                      <Icon aria-hidden /> {LEAD_STATE_META[s].label}
                    </Chip>
                  );
                })}
              </div>
            )}
          />
          <FieldError message={e.leadStates?.message} />
          <ul className="grid gap-1.5 text-xs text-fg-muted">
            {states.map((s) => (
              <li key={s}>
                <span className="font-medium text-fg-secondary">{LEAD_STATE_META[s].label}:</span> {LEAD_STATE_META[s].description}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Priority" description="Agents are served from the highest-priority queue that has eligible leads.">
          <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
            <Field label="Place at priority" htmlFor="queuePriority">
              <Controller
                control={control}
                name="queuePriority"
                render={({ field }) => (
                  <Select
                    id="queuePriority"
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                    options={Array.from({ length: Math.max(ordered.length + 1, 5) }, (_, i) => ({ value: String(i + 1), label: `${i + 1}${i === 0 ? " (highest)" : ""}` }))}
                  />
                )}
              />
            </Field>
            <div>
              <p className="mb-1.5 text-xs font-medium text-fg-secondary">Resulting order</p>
              {queues.isLoading ? (
                <Skeleton className="h-40" />
              ) : (
                <ol className="divide-y divide-border rounded-lg border border-border">
                  {[...ordered.slice(0, priority - 1).map((q) => ({ q })), { q: null }, ...ordered.slice(priority - 1).map((q) => ({ q }))].map(({ q }, i) => (
                    <li key={q?.id ?? "new"} className={cn("flex items-center gap-3 px-3 py-2 text-[13px]", !q && "bg-brand-soft")}>
                      <span className="w-4 font-mono text-xs text-fg-muted tabular">{i + 1}</span>
                      {q ? (
                        <>
                          <span className={cn("flex-1 truncate", q.enabled ? "text-fg-secondary" : "text-fg-muted")}>{q.name}</span>
                          <span className="hidden text-xs text-fg-muted sm:block">{q.leadStates.map((s) => LEAD_STATE_META[s].label).join(", ")}</span>
                        </>
                      ) : (
                        <span className="flex-1 font-medium text-fg">This campaign</span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
