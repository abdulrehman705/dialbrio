"use client";

import { Controller } from "react-hook-form";
import { ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SettingRow, SettingsCard, SettingsForm, useSettingsForm } from "../kit";
import { useCanEdit } from "./shared";

const time = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM");
const schema = z
  .object({
    windowStart: time,
    windowEnd: time,
    windowTimezone: z.enum(["contact", "subaccount"]),
    dncScrub: z.boolean(),
    quietHours: z.boolean(),
    requireConsentForSms: z.boolean(),
    requireConsentForCalls: z.boolean(),
  })
  .refine((v) => v.windowEnd > v.windowStart, { path: ["windowEnd"], message: "End must be after start" });
type Values = z.infer<typeof schema>;

const defaults: Values = { windowStart: "09:00", windowEnd: "20:00", windowTimezone: "contact", dncScrub: true, quietHours: true, requireConsentForSms: true, requireConsentForCalls: false };

export function ComplianceSettings() {
  const canEdit = useCanEdit("compliance");
  const { form, ...rest } = useSettingsForm<Values>("compliance", schema, defaults);
  const { register, control, formState } = form;
  const sw = (name: "dncScrub" | "quietHours" | "requireConsentForSms" | "requireConsentForCalls", label: string) => (
    <Controller control={control} name={name} render={({ field }) => <Switch id={name} aria-label={label} checked={field.value} onCheckedChange={field.onChange} />} />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-text" aria-hidden />
        <p className="text-[13px] leading-5 text-fg-secondary">
          Compliance rules are <span className="font-medium text-fg">deterministic</span>: they are checked before every call and message, the
          result is written to the audit log, and nothing — including AI — can override a block.
        </p>
      </div>
      <SettingsForm form={form} {...rest} readOnly={!canEdit} readOnlyReason="Only admins can change compliance rules.">
        <SettingsCard title="Default calling window" description="Campaigns can narrow this window but never widen it.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Start" htmlFor="windowStart" error={formState.errors.windowStart?.message}>
              <Input id="windowStart" type="time" aria-describedby="windowStart-desc" {...register("windowStart")} />
            </Field>
            <Field label="End" htmlFor="windowEnd" error={formState.errors.windowEnd?.message}>
              <Input id="windowEnd" type="time" aria-invalid={!!formState.errors.windowEnd} aria-describedby="windowEnd-desc" {...register("windowEnd")} />
            </Field>
            <Field label="Evaluated in" htmlFor="windowTimezone">
              <Controller
                control={control}
                name="windowTimezone"
                render={({ field }) => (
                  <Select id="windowTimezone" value={field.value} onValueChange={field.onChange} options={[{ value: "contact", label: "Contact's local time" }, { value: "subaccount", label: "Sub-account time zone" }]} />
                )}
              />
            </Field>
          </div>
          <SettingRow label="State quiet hours" htmlFor="quietHours" description="Apply stricter state-specific calling hours and holiday restrictions automatically.">
            {sw("quietHours", "State quiet hours")}
          </SettingRow>
        </SettingsCard>
        <SettingsCard title="Do Not Call">
          <SettingRow label="Scrub against DNC lists" htmlFor="dncScrub" description="Check the internal DNC list and national registry before every dial.">
            {sw("dncScrub", "Scrub against DNC lists")}
          </SettingRow>
        </SettingsCard>
        <SettingsCard title="Consent" description="Consent state comes from GoHighLevel and SMS opt-outs (STOP).">
          <SettingRow label="Require consent for SMS" htmlFor="requireConsentForSms" description="Block outbound SMS to contacts without recorded consent.">
            {sw("requireConsentForSms", "Require consent for SMS")}
          </SettingRow>
          <SettingRow label="Require consent for calls" htmlFor="requireConsentForCalls" description="Block calls to contacts whose consent is unknown, not just revoked.">
            {sw("requireConsentForCalls", "Require consent for calls")}
          </SettingRow>
        </SettingsCard>
      </SettingsForm>
    </div>
  );
}
