"use client";

import * as React from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNowStrict } from "date-fns";
import { Lock, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { DISPOSITION_CODES, LEAD_STATES, type DialQueue } from "@dialbrio/types";
import { DISPOSITION_META, LEAD_STATE_META } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/states";
import { useQueueItems, useUpdateQueue } from "@/lib/queries";
import { cn, formatNumber, formatPhone } from "@/lib/utils";
import { formatMinutes, formatWindow, slaMinutes, WEEKDAYS } from "./utils";

const rulesSchema = z
  .object({
    leadStates: z.array(z.enum(LEAD_STATES)).min(1, "Select at least one lifecycle state"),
    maxAttempts: z.number({ error: "Enter a number" }).int().min(1, "At least 1").max(20, "At most 20"),
    retryRules: z.array(
      z.object({
        disposition: z.enum(DISPOSITION_CODES),
        delayMinutes: z.number({ error: "Required" }).int().min(1, "Min 1"),
        maxAttempts: z.number({ error: "Required" }).int().min(1, "Min 1").max(20, "Max 20"),
      }),
    ),
    callingWindow: z.object({
      days: z.array(z.number()).min(1, "Select at least one day"),
      start: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
      end: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
      timezone: z.string(),
    }),
  })
  .superRefine((v, ctx) => {
    if (v.callingWindow.start >= v.callingWindow.end) ctx.addIssue({ code: "custom", path: ["callingWindow", "end"], message: "End must be after start" });
    const seen = new Set<string>();
    v.retryRules.forEach((r, i) => {
      if (seen.has(r.disposition)) ctx.addIssue({ code: "custom", path: ["retryRules", i, "disposition"], message: "Duplicate disposition" });
      seen.add(r.disposition);
    });
  });

type RulesValues = z.infer<typeof rulesSchema>;
const retryable = ["no_answer", "busy", "voicemail", "callback", "interested"] as const;

export function QueueDetail({ queue, open, onOpenChange }: { queue: DialQueue | undefined; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [tab, setTab] = React.useState("leads");
  React.useEffect(() => {
    if (open) setTab("leads");
  }, [open, queue?.id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={queue?.name ?? "Queue"}
        className="max-w-2xl"
        header={
          queue && (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl font-bold text-fg-muted">{queue.priority}</span>
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-fg">{queue.name}</h2>
                {!queue.enabled && <span className="text-xs text-fg-muted">(paused)</span>}
              </div>
              <p className="mt-1 text-[13px] text-fg-muted">
                {formatNumber(queue.waiting)} waiting, oldest {queue.enabled ? formatMinutes(queue.oldestWaitMinutes) : "–"} against a {formatMinutes(slaMinutes(queue))} target, {queue.throughputPerHour} dialed per hour
              </p>
            </div>
          )
        }
      >
        {queue && (
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="px-5">
              <TabsTrigger value="leads">
                Up next
              </TabsTrigger>
              <TabsTrigger value="rules">
                Rules
              </TabsTrigger>
            </TabsList>
            <TabsContent value="leads" className="min-h-0 flex-1 overflow-y-auto">
              <QueueItems queue={queue} />
            </TabsContent>
            <TabsContent value="rules" className="flex min-h-0 flex-1 flex-col">
              <RulesForm key={queue.id} queue={queue} onSaved={() => setTab("leads")} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}

function QueueItems({ queue }: { queue: DialQueue }) {
  const { data, isLoading, isError, refetch } = useQueueItems(queue.id);

  if (isError) return <ErrorState compact onRetry={() => void refetch()} />;
  if (isLoading)
    return (
      <ul className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="space-y-2 px-5 py-4">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-full max-w-md" />
          </li>
        ))}
      </ul>
    );
  if (!data?.length)
    return <EmptyState compact icon={Users} title="No leads waiting" description="Leads that match this queue's lifecycle and source rules will appear here with the reason they qualified." />;

  return (
    <>
      <p className="border-b border-border px-5 py-2.5 text-xs text-fg-muted">
        The next {data.length} of {formatNumber(queue.waiting)} leads, in the order agents will get them, with the reason each one is here.
      </p>
      <ol className="divide-y divide-border">
        {data.map((item, i) => {
          const eligibleNow = new Date(item.eligibleAt).getTime() <= Date.now();
          return (
            <li key={item.id} className="flex gap-3 px-5 py-3.5">
              <span className="w-5 pt-0.5 text-right font-mono text-xs text-fg-muted tabular">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[13px] font-medium text-fg">{item.contactName}</span>
                  <span className="font-mono text-xs text-fg-muted">{formatPhone(item.phone)}</span>
                  <span className="text-xs text-fg-muted">{LEAD_STATE_META[item.leadState].label}</span>
                </div>
                <p className="mt-1 text-[13px] leading-5 text-fg-secondary">{item.reason}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                  <span className="tabular">
                    {item.attempts}/{queue.maxAttempts} attempts
                  </span>
                  <span>Queued {formatDistanceToNowStrict(new Date(item.enqueuedAt), { addSuffix: true })}</span>
                  {eligibleNow ? (
                    <span className="text-success-text">Eligible now</span>
                  ) : (
                    <span>Eligible {formatDistanceToNowStrict(new Date(item.eligibleAt), { addSuffix: true })}</span>
                  )}
                  {item.reservedBy && (
                    <span className="inline-flex items-center gap-1 text-fg-secondary">
                      <Lock className="size-3" aria-hidden /> Reserved by {item.reservedBy}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function RulesForm({ queue, onSaved }: { queue: DialQueue; onSaved: () => void }) {
  const update = useUpdateQueue();
  const form = useForm<RulesValues>({
    resolver: zodResolver(rulesSchema),
    defaultValues: { leadStates: queue.leadStates, maxAttempts: queue.maxAttempts, retryRules: queue.retryRules, callingWindow: queue.callingWindow },
  });
  const { register, control, handleSubmit, formState, watch, reset } = form;
  const retry = useFieldArray({ control, name: "retryRules" });
  const window = watch("callingWindow");

  const onSubmit = handleSubmit((values) =>
    update.mutate(
      { id: queue.id, patch: values },
      {
        onSuccess: () => {
          toast.success(`${queue.name} rules saved`, { description: "New rules apply to the next lead served from this queue." });
          reset(values);
          onSaved();
        },
        onError: () => toast.error("Couldn't save rules", { description: "Nothing was changed. Try again." }),
      },
    ),
  );

  const errors = formState.errors;
  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <fieldset className="space-y-2">
          <legend className="text-[13px] font-semibold text-fg">Lifecycle states</legend>
          <p className="text-xs text-fg-muted">Only leads currently in these states enter this queue.</p>
          <Controller
            control={control}
            name="leadStates"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Lifecycle states">
                {LEAD_STATES.map((s) => {
                  const on = field.value.includes(s);
                  const Icon = LEAD_STATE_META[s].icon!;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => field.onChange(on ? field.value.filter((x) => x !== s) : [...field.value, s])}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition-colors max-lg:h-11",
                        on ? "border-brand bg-brand-soft text-fg" : "border-border text-fg-secondary hover:bg-surface-hover",
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden /> {LEAD_STATE_META[s].label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.leadStates && <p className="text-xs text-danger-text" role="alert">{errors.leadStates.message}</p>}
        </fieldset>

        <Field label="Max attempts per lead" htmlFor="maxAttempts" hint="After this many attempts the lead leaves the queue and its lifecycle is re-evaluated." error={errors.maxAttempts?.message}>
          <Input id="maxAttempts" type="number" inputMode="numeric" min={1} max={20} className="w-28" aria-describedby="maxAttempts-desc" aria-invalid={!!errors.maxAttempts} {...register("maxAttempts", { valueAsNumber: true })} />
        </Field>

        <fieldset className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <legend className="text-[13px] font-semibold text-fg">Retry rules</legend>
              <p className="text-xs text-fg-muted">When a call ends with this disposition, wait, then re-queue — up to the limit.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={retry.fields.length >= retryable.length}
              onClick={() => {
                const used = new Set(watch("retryRules").map((r) => r.disposition));
                const next = retryable.find((d) => !used.has(d)) ?? "no_answer";
                retry.append({ disposition: next, delayMinutes: 60, maxAttempts: 3 });
              }}
            >
              <Plus /> Add rule
            </Button>
          </div>
          {retry.fields.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-fg-muted">No retry rules — leads are attempted once per campaign cycle.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-border">
              <div className="hidden grid-cols-[1fr_120px_110px_40px] gap-2 bg-surface-sunken px-3 py-1.5 text-xs font-medium text-fg-muted sm:grid">
                <span>Disposition</span>
                <span>Wait (min)</span>
                <span>Max retries</span>
                <span className="sr-only">Remove</span>
              </div>
              <ul className="divide-y divide-border">
                {retry.fields.map((f, i) => {
                  const err = errors.retryRules?.[i];
                  return (
                    <li key={f.id} className="grid grid-cols-2 gap-2 px-3 py-2 sm:grid-cols-[1fr_120px_110px_40px] sm:items-start">
                      <div className="col-span-2 sm:col-span-1">
                        <Controller
                          control={control}
                          name={`retryRules.${i}.disposition`}
                          render={({ field }) => (
                            <Select
                              size="sm"
                              aria-label={`Rule ${i + 1} disposition`}
                              aria-invalid={!!err?.disposition}
                              value={field.value}
                              onValueChange={field.onChange}
                              options={retryable.map((d) => ({ value: d, label: DISPOSITION_META[d].label }))}
                            />
                          )}
                        />
                        {err?.disposition && <p className="mt-1 text-xs text-danger-text">{err.disposition.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`rr-${i}-delay`} className="sm:sr-only">
                          Wait (min)
                        </Label>
                        <Input id={`rr-${i}-delay`} type="number" min={1} className="h-8" aria-invalid={!!err?.delayMinutes} {...register(`retryRules.${i}.delayMinutes`, { valueAsNumber: true })} />
                        {err?.delayMinutes && <p className="mt-1 text-xs text-danger-text">{err.delayMinutes.message}</p>}
                      </div>
                      <div className="flex items-end gap-2 sm:contents">
                        <div className="flex-1">
                          <Label htmlFor={`rr-${i}-max`} className="sm:sr-only">
                            Max retries
                          </Label>
                          <Input id={`rr-${i}-max`} type="number" min={1} className="h-8" aria-invalid={!!err?.maxAttempts} {...register(`retryRules.${i}.maxAttempts`, { valueAsNumber: true })} />
                          {err?.maxAttempts && <p className="mt-1 text-xs text-danger-text">{err.maxAttempts.message}</p>}
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove rule ${i + 1}`} onClick={() => retry.remove(i)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <div>
            <legend className="text-[13px] font-semibold text-fg">Calling window</legend>
            <p className="text-xs text-fg-muted">Evaluated in each contact&apos;s local time zone. {formatWindow(window)}</p>
          </div>
          <Controller
            control={control}
            name="callingWindow.days"
            render={({ field }) => (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Calling days">
                {WEEKDAYS.map((d) => {
                  const on = field.value.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      aria-pressed={on}
                      aria-label={d.short}
                      onClick={() => field.onChange(on ? field.value.filter((x) => x !== d.value) : [...field.value, d.value])}
                      className={cn(
                        "h-8 w-11 rounded-md border text-xs font-medium transition-colors max-lg:h-11",
                        on ? "border-brand bg-brand-soft text-fg" : "border-border text-fg-muted hover:bg-surface-hover",
                      )}
                    >
                      {d.short}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.callingWindow?.days && <p className="text-xs text-danger-text" role="alert">{errors.callingWindow.days.message}</p>}
          <div className="grid max-w-sm grid-cols-2 gap-3">
            <Field label="Start" htmlFor="cw-start" error={errors.callingWindow?.start?.message}>
              <Input id="cw-start" type="time" aria-invalid={!!errors.callingWindow?.start} {...register("callingWindow.start")} />
            </Field>
            <Field label="End" htmlFor="cw-end" error={errors.callingWindow?.end?.message}>
              <Input id="cw-end" type="time" aria-invalid={!!errors.callingWindow?.end} {...register("callingWindow.end")} />
            </Field>
          </div>
          <p className="flex items-start gap-2 rounded-md bg-surface-sunken px-3 py-2 text-xs text-fg-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success-text" aria-hidden />
            DNC, consent and calling-window checks run before every dial and can&apos;t be disabled here.
          </p>
        </fieldset>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        {formState.isDirty && <span className="mr-auto text-xs text-fg-muted">Unsaved changes</span>}
        <Button type="button" variant="ghost" onClick={() => reset()} disabled={!formState.isDirty || update.isPending}>
          Discard
        </Button>
        <Button type="submit" variant="primary" loading={update.isPending} disabled={!formState.isDirty}>
          Save rules
        </Button>
      </div>
    </form>
  );
}
