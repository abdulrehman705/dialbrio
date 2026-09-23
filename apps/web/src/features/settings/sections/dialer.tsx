"use client";

import { Controller } from "react-hook-form";
import { Info, Play, TriangleAlert, Upload } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { useDialerSession } from "@/lib/queries";
import { formatClock } from "@/lib/utils";
import { SettingRow, SettingsCard, SettingsForm, useSettingsForm } from "../kit";
import { useCanEdit } from "./shared";

const schema = z.object({
  defaultDialMode: z.enum(["preview", "power", "parallel", "progressive"]),
  parallelLines: z.number().int().min(1).max(4),
  amd: z.boolean(),
  wrapUpSeconds: z.number({ error: "Enter a number" }).int().min(0, "Minimum 0").max(300, "Maximum 300 seconds"),
  autoDialNext: z.boolean(),
  voicemailDrop: z.boolean(),
  localPresence: z.boolean(),
  maxRingSeconds: z.number({ error: "Enter a number" }).int().min(15, "Minimum 15 seconds").max(60, "Maximum 60 seconds"),
  recordCalls: z.boolean(),
});
type Values = z.infer<typeof schema>;

const defaults: Values = { defaultDialMode: "power", parallelLines: 2, amd: true, wrapUpSeconds: 30, autoDialNext: false, voicemailDrop: true, localPresence: true, maxRingSeconds: 30, recordCalls: true };

function NumberField({ id, suffix, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { suffix: string; error?: string }) {
  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <div className="flex items-center gap-2">
        <Input id={id} type="number" inputMode="numeric" className="w-24 text-right tabular" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
        <span className="text-[13px] text-fg-muted">{suffix}</span>
      </div>
      {error && (
        <span id={`${id}-err`} role="alert" className="text-xs text-danger-text">
          {error}
        </span>
      )}
    </div>
  );
}

function SwitchField({ name, control, label }: { name: keyof Values; control: ReturnType<typeof useSettingsForm<Values>>["form"]["control"]; label: string }) {
  return <Controller control={control} name={name} render={({ field }) => <Switch id={name} aria-label={label} checked={!!field.value} onCheckedChange={field.onChange} />} />;
}

/** The current agent's drop recordings. Uploading and recording in-browser arrive with Twilio (Phase 3). */
function VoicemailRecordings() {
  const { data, isLoading } = useDialerSession();
  const vm = data?.voicemailDrop;
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-fg">Your recordings</p>
        <Tooltip content="Recording and upload arrive with Twilio in Phase 3">
          <span tabIndex={0}>
            <Button type="button" size="xs" disabled>
              <Upload /> Upload
            </Button>
          </span>
        </Tooltip>
      </div>
      {isLoading ? (
        <Skeleton className="h-11" />
      ) : vm ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          <li className="flex items-center gap-3 px-3 py-2">
            <Tooltip content="Playback arrives with Twilio in Phase 3">
              <span tabIndex={0}>
                <Button type="button" variant="ghost" size="icon-xs" disabled aria-label={`Play ${vm.name}`}>
                  <Play />
                </Button>
              </span>
            </Tooltip>
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg">{vm.name}</span>
            <span className="font-mono text-xs text-fg-muted">{formatClock(vm.durationSec)}</span>
            <span className="text-xs text-brand-text">Default</span>
          </li>
        </ul>
      ) : (
        <p className="text-xs text-fg-muted">No recordings yet. Reps record their own so the message sounds like them.</p>
      )}
    </div>
  );
}

export function DialerSettings() {
  const canEdit = useCanEdit("dialer");
  const { form, ...rest } = useSettingsForm<Values>("dialer", schema, defaults);
  const { register, control, formState, watch } = form;
  const recording = watch("recordCalls");
  const lines = watch("parallelLines");
  const amd = watch("amd");

  return (
    <SettingsForm form={form} {...rest} readOnly={!canEdit} readOnlyReason="Dialer defaults are set by your manager or admin. You can change auto-dial for your own session in the dialer.">
      <SettingsCard title="Session defaults" description="Applied to new sessions. Campaigns can override the dial mode.">
        <SettingRow label="Default dial mode" htmlFor="defaultDialMode" description="Preview shows the lead first. Power dials one line. Parallel rings up to four and connects the first person who answers.">
          <Controller
            control={control}
            name="defaultDialMode"
            render={({ field }) => (
              <Select
                id="defaultDialMode"
                className="sm:w-56"
                value={field.value}
                onValueChange={field.onChange}
                options={[
                  { value: "preview", label: "Preview", description: "Agent reviews, then dials" },
                  { value: "power", label: "Power", description: "One line per agent, auto-dials next" },
                  { value: "parallel", label: "Parallel", description: "Up to 4 lines, first live answer connects" },
                  { value: "progressive", label: "Progressive", description: "Dials when an agent frees up" },
                ]}
              />
            )}
          />
        </SettingRow>
        <SettingRow
          label="Parallel lines"
          htmlFor="parallelLines"
          description="Lines per agent when a campaign dials in parallel. Four suits cold lists; one or two suits warm leads you don't want to miss."
        >
          <Controller
            control={control}
            name="parallelLines"
            render={({ field }) => (
              <Segmented
                label="Parallel lines"
                value={String(field.value) as "1" | "2" | "3" | "4"}
                onValueChange={(v) => field.onChange(Number(v))}
                options={(["1", "2", "3", "4"] as const).map((n) => ({ value: n, label: `${n} ${n === "1" ? "line" : "lines"}` }))}
              />
            )}
          />
        </SettingRow>
        <SettingRow
          label="Answering-machine detection"
          htmlFor="amd"
          description="Voicemail greetings are dropped before they reach a rep, and live answers connect in under a second."
        >
          <SwitchField name="amd" control={control} label="Answering-machine detection" />
        </SettingRow>
        {lines > 1 && !amd && (
          <p role="alert" className="flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2.5 text-xs leading-5 text-warning-text">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Parallel dialing without answering-machine detection sends voicemail greetings to your reps. Turn detection on, or drop to one line.
          </p>
        )}
        <SettingRow label="Wrap-up time" htmlFor="wrapUpSeconds" description="Time to disposition and take notes before the next lead is dialed.">
          <NumberField id="wrapUpSeconds" suffix="seconds" error={formState.errors.wrapUpSeconds?.message} {...register("wrapUpSeconds", { valueAsNumber: true })} />
        </SettingRow>
        <SettingRow label="Auto-dial next lead" htmlFor="autoDialNext" description="Start the next call automatically after a disposition is saved.">
          <SwitchField name="autoDialNext" control={control} label="Auto-dial next lead" />
        </SettingRow>
        <SettingRow label="Max ring time" htmlFor="maxRingSeconds" description="Unanswered calls end after this and are dispositioned No answer.">
          <NumberField id="maxRingSeconds" suffix="seconds" error={formState.errors.maxRingSeconds?.message} {...register("maxRingSeconds", { valueAsNumber: true })} />
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="Caller ID & voicemail">
        <SettingRow label="Local presence" htmlFor="localPresence" description="Prefer a caller ID with the contact's area code when one is healthy.">
          <SwitchField name="localPresence" control={control} label="Local presence" />
        </SettingRow>
        <SettingRow label="Voicemail drop" htmlFor="voicemailDrop" description="One click leaves a pre-recorded message in the rep's own voice and moves to the next call.">
          <SwitchField name="voicemailDrop" control={control} label="Voicemail drop" />
        </SettingRow>
        <VoicemailRecordings />
      </SettingsCard>
      <SettingsCard title="Recording">
        <SettingRow label="Record calls" htmlFor="recordCalls" description="Recordings are encrypted and kept for 365 days.">
          <SwitchField name="recordCalls" control={control} label="Record calls" />
        </SettingRow>
        {recording && (
          <p className="flex items-start gap-2 rounded-md bg-info-soft px-3 py-2.5 text-xs leading-5 text-info-text">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Some states require every party's consent to record. When recording is on, the playbook opener includes a recording disclosure, and
            calls to two-party-consent states are flagged if the disclosure step is skipped.
          </p>
        )}
      </SettingsCard>
    </SettingsForm>
  );
}
