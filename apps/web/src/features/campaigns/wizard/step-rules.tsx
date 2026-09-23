"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ArrowRight, Lock, MessageSquare, Phone, Plus, RotateCcw, ShieldCheck, Timer, Trash2, Voicemail } from "lucide-react";
import { DISPOSITION_CODES, type DispositionCode } from "@dialbrio/types";
import { DISPOSITION_META } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatMinutes, WEEKDAYS } from "@/features/queue/utils";
import type { CampaignFormValues } from "../schema";
import { Chip, FieldError, Section, StepHeader } from "./controls";

const RETRYABLE: DispositionCode[] = ["no_answer", "busy", "voicemail", "callback", "interested"];

export function StepCallingRules() {
  const { control, register, formState, watch } = useFormContext<CampaignFormValues>();
  const retry = useFieldArray({ control, name: "retryRules" });
  const e = formState.errors;

  return (
    <>
      <StepHeader title="Calling rules" description="When leads may be called and how unanswered calls are retried." />
      <div className="space-y-7">
        <Section title="Calling window" description="Evaluated in each contact's local time zone before every dial.">
          <Controller
            control={control}
            name="callingWindow.days"
            render={({ field }) => (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Calling days">
                {WEEKDAYS.map((d) => {
                  const on = field.value.includes(d.value);
                  return (
                    <Chip key={d.value} selected={on} onToggle={() => field.onChange(on ? field.value.filter((x) => x !== d.value) : [...field.value, d.value])}>
                      {d.short}
                    </Chip>
                  );
                })}
              </div>
            )}
          />
          <FieldError message={e.callingWindow?.days?.message} />
          <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Start" htmlFor="cw-start" error={e.callingWindow?.start?.message}>
              <Input id="cw-start" type="time" aria-invalid={!!e.callingWindow?.start} {...register("callingWindow.start")} />
            </Field>
            <Field label="End" htmlFor="cw-end" error={e.callingWindow?.end?.message}>
              <Input id="cw-end" type="time" aria-invalid={!!e.callingWindow?.end} {...register("callingWindow.end")} />
            </Field>
            <Field label="Time zone" htmlFor="cw-tz" className="col-span-2 sm:col-span-1">
              <Controller
                control={control}
                name="callingWindow.timezone"
                render={({ field }) => (
                  <Select
                    id="cw-tz"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={[
                      { value: "contact", label: "Contact's local time" },
                      { value: "America/Denver", label: "Sub-account (Mountain)" },
                    ]}
                  />
                )}
              />
            </Field>
          </div>
          <p className="flex items-start gap-2 rounded-md bg-surface-sunken px-3 py-2 text-xs leading-5 text-fg-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success-text" aria-hidden />
            DNC, consent and calling-window checks always run before a call is placed. They are deterministic and can&apos;t be overridden by agents or AI.
          </p>
        </Section>

        <Field label="Max attempts per lead" htmlFor="maxAttempts" error={e.maxAttempts?.message} hint="After the last attempt the lead's lifecycle is re-evaluated (usually → Aged or Zombie).">
          <Input id="maxAttempts" type="number" inputMode="numeric" min={1} max={20} className="w-28" aria-invalid={!!e.maxAttempts} {...register("maxAttempts", { valueAsNumber: true })} />
        </Field>

        <Section title="Retry rules" description="When a call ends with this outcome, wait, then return the lead to the queue.">
          {retry.fields.length > 0 && (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {retry.fields.map((f, i) => {
                const err = e.retryRules?.[i];
                return (
                  <li key={f.id} className="grid grid-cols-2 items-start gap-2 p-3 sm:grid-cols-[1fr_130px_120px_40px]">
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor={`rr-${i}-d`} className="mb-1 block">
                        When outcome is
                      </Label>
                      <Controller
                        control={control}
                        name={`retryRules.${i}.disposition`}
                        render={({ field }) => (
                          <Select id={`rr-${i}-d`} size="sm" value={field.value} onValueChange={field.onChange} aria-invalid={!!err?.disposition} options={RETRYABLE.map((d) => ({ value: d, label: DISPOSITION_META[d].label }))} />
                        )}
                      />
                      <FieldError message={err?.disposition?.message} />
                    </div>
                    <div>
                      <Label htmlFor={`rr-${i}-w`} className="mb-1 block">
                        Wait (minutes)
                      </Label>
                      <Input id={`rr-${i}-w`} type="number" min={1} className="h-8" aria-invalid={!!err?.delayMinutes} {...register(`retryRules.${i}.delayMinutes`, { valueAsNumber: true })} />
                      <FieldError message={err?.delayMinutes?.message} />
                    </div>
                    <div>
                      <Label htmlFor={`rr-${i}-m`} className="mb-1 block">
                        Max retries
                      </Label>
                      <Input id={`rr-${i}-m`} type="number" min={1} className="h-8" aria-invalid={!!err?.maxAttempts} {...register(`retryRules.${i}.maxAttempts`, { valueAsNumber: true })} />
                      <FieldError message={err?.maxAttempts?.message} />
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" className="col-span-2 justify-self-end sm:col-span-1 sm:mt-5" aria-label={`Remove retry rule ${i + 1}`} onClick={() => retry.remove(i)}>
                      <Trash2 />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          <Button
            type="button"
            size="sm"
            disabled={retry.fields.length >= RETRYABLE.length}
            onClick={() => {
              const used = new Set(watch("retryRules").map((r) => r.disposition));
              retry.append({ disposition: RETRYABLE.find((d) => !used.has(d)) ?? "no_answer", delayMinutes: 60, maxAttempts: 2 });
            }}
          >
            <Plus /> Add retry rule
          </Button>
        </Section>
      </div>
    </>
  );
}

const NEXT_ACTION: Record<DispositionCode, string> = {
  interested: "Warm · follow-up in 1 day",
  appointment: "Book in GHL calendar · stop sequence",
  callback: "Schedule callback at chosen time",
  no_answer: "Retry per rules",
  busy: "Retry per rules",
  voicemail: "Retry + optional SMS",
  not_interested: "Mark lost",
  wrong_number: "Flag number invalid · lost",
  dnc: "Add to DNC · never call again",
};
const REQUIRED: DispositionCode[] = ["dnc"];

export function StepDispositions() {
  const { control, formState } = useFormContext<CampaignFormValues>();
  return (
    <>
      <StepHeader title="Dispositions" description="Outcomes agents choose after each call. Each one triggers a deterministic next action." />
      <Controller
        control={control}
        name="dispositions"
        render={({ field }) => (
          <ul className="grid gap-2 md:grid-cols-2" aria-label="Dispositions">
            {DISPOSITION_CODES.map((code) => {
              const meta = DISPOSITION_META[code];
              const Icon = meta.icon!;
              const on = field.value.includes(code);
              const locked = REQUIRED.includes(code);
              return (
                <li key={code}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                      on ? "border-border-strong bg-surface" : "border-border bg-surface-sunken opacity-70",
                      locked && "cursor-default",
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-sunken text-fg-secondary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-fg">
                        {meta.label}
                        <kbd className="rounded-xs border border-border px-1 font-mono text-[10px] text-fg-muted" aria-label={`Shortcut ${meta.shortcut}`}>
                          {meta.shortcut}
                        </kbd>
                      </span>
                      <span className="block truncate text-xs text-fg-muted">{NEXT_ACTION[code]}</span>
                    </span>
                    {locked ? (
                      <span className="flex items-center gap-1 text-[11px] text-fg-muted">
                        <Lock className="size-3" aria-hidden /> Required
                      </span>
                    ) : (
                      <Switch checked={on} onCheckedChange={(v) => field.onChange(v ? DISPOSITION_CODES.filter((c) => c === code || field.value.includes(c)) : field.value.filter((c) => c !== code))} aria-label={`Enable ${meta.label}`} />
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      />
      <div className="mt-3">
        <FieldError message={formState.errors.dispositions?.message} />
      </div>
    </>
  );
}

export function StepFollowUp() {
  const { control, register, formState, watch } = useFormContext<CampaignFormValues>();
  const sms = watch("followUp.onNoAnswerSms");
  const vmDrop = watch("followUp.voicemailDrop");
  const template = watch("followUp.smsTemplate") ?? "";
  const rules = watch("retryRules");
  const noAnswer = rules.find((r) => r.disposition === "no_answer");
  const e = formState.errors.followUp;
  const segments = Math.max(1, Math.ceil(template.length / 160));

  const sequence = [
    { icon: Phone, label: "Call" },
    { icon: RotateCcw, label: vmDrop ? "No answer or voicemail" : "No answer" },
    ...(vmDrop ? [{ icon: Voicemail, label: "Drop voicemail" }] : []),
    ...(noAnswer ? [{ icon: Timer, label: `Wait ${formatMinutes(noAnswer.delayMinutes)}` }, { icon: Phone, label: "Retry" }] : []),
    ...(sms ? [{ icon: MessageSquare, label: "SMS" }] : []),
    ...(noAnswer && noAnswer.maxAttempts > 1 ? [{ icon: Phone, label: `Up to ${noAnswer.maxAttempts} retries` }] : []),
  ];

  return (
    <>
      <StepHeader title="Follow-up" description="What happens automatically between calls. Every step re-checks compliance and lead state first." />
      <div className="space-y-7">
        <section aria-label="Sequence preview" className="rounded-lg border border-border bg-surface-sunken p-4">
          <p className="mb-3 text-xs font-medium text-fg-secondary">Sequence for an unanswered lead</p>
          <ol className="flex flex-wrap items-center gap-1.5">
            {sequence.map((s, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="inline-flex h-7 items-center rounded-[5px] border border-border bg-surface px-2 font-mono text-[11px] text-fg">{s.label}</span>
                {i < sequence.length - 1 && <ArrowRight className="size-3.5 text-fg-muted" aria-hidden />}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-fg-muted">Sequences run on a durable workflow engine: they survive restarts and never send the same step twice.</p>
        </section>

        <Section title="Voicemail drop">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <span>
              <span className="block text-[13px] font-medium text-fg">Let reps drop a pre-recorded voicemail</span>
              <span className="block text-xs leading-5 text-fg-muted">
                One click leaves the message in the rep&apos;s own voice and moves on to the next lead. Saves about an hour per rep per day of repeating the same 25 seconds.
              </span>
            </span>
            <Controller control={control} name="followUp.voicemailDrop" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Allow voicemail drop" />} />
          </label>
        </Section>

        <Section title="SMS after no answer">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <span>
              <span className="block text-[13px] font-medium text-fg">Send an SMS when a call goes unanswered</span>
              <span className="block text-xs text-fg-muted">Sent once per lead, only with consent and inside the calling window.</span>
            </span>
            <Controller control={control} name="followUp.onNoAnswerSms" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Send SMS after no answer" />} />
          </label>
          {sms && (
            <Field
              label="Message"
              htmlFor="smsTemplate"
              error={e?.smsTemplate?.message}
              hint={
                <>
                  {template.length}/320 · {segments} segment{segments > 1 ? "s" : ""} · Variables: <code className="font-mono">{"{{first_name}}"}</code>, <code className="font-mono">{"{{agent_name}}"}</code>
                </>
              }
            >
              <Textarea id="smsTemplate" rows={3} aria-invalid={!!e?.smsTemplate} aria-describedby="smsTemplate-desc" {...register("followUp.smsTemplate")} />
            </Field>
          )}
        </Section>

        <Field label="Callback reminder" htmlFor="cbr" hint="Notify the assigned agent before a scheduled callback is due.">
          <Controller
            control={control}
            name="followUp.callbackReminderMinutes"
            render={({ field }) => (
              <Select
                id="cbr"
                className="max-w-60"
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
                options={[0, 5, 10, 15, 30].map((m) => ({ value: String(m), label: m ? `${m} minutes before` : "No reminder" }))}
              />
            )}
          />
        </Field>
      </div>
    </>
  );
}
