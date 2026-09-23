"use client";

import { Controller } from "react-hook-form";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { z } from "zod";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import { SettingRow, SettingsCard, SettingsForm, useSettingsForm } from "../kit";
import { TIMEZONES } from "./shared";

const schema = z.object({
  displayName: z.string().trim().min(2, "Enter at least 2 characters").max(60),
  timezone: z.string().min(1),
  dateFormat: z.enum(["MMM d, yyyy", "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"]),
  timeFormat: z.enum(["12h", "24h"]),
});
type Values = z.infer<typeof schema>;

export function GeneralSettings() {
  const { form, ...rest } = useSettingsForm<Values>("general", schema, { displayName: "", timezone: "America/Denver", dateFormat: "MMM d, yyyy", timeFormat: "12h" });
  const { register, control, formState } = form;
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <SettingsForm form={form} {...rest}>
        <SettingsCard title="Profile" description="How you appear to teammates and in call history.">
          <Field label="Display name" htmlFor="displayName" error={formState.errors.displayName?.message}>
            <Input id="displayName" autoComplete="name" aria-invalid={!!formState.errors.displayName} aria-describedby="displayName-desc" {...register("displayName")} />
          </Field>
        </SettingsCard>
        <SettingsCard title="Regional" description="Used for timestamps, reports and your callback reminders.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Time zone" htmlFor="timezone" hint="Contacts are always called in their own local time.">
              <Controller control={control} name="timezone" render={({ field }) => <Select id="timezone" value={field.value} onValueChange={field.onChange} options={TIMEZONES} />} />
            </Field>
            <Field label="Date format" htmlFor="dateFormat">
              <Controller
                control={control}
                name="dateFormat"
                render={({ field }) => (
                  <Select
                    id="dateFormat"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={[
                      { value: "MMM d, yyyy", label: "Sep 23, 2026" },
                      { value: "MM/dd/yyyy", label: "09/23/2026" },
                      { value: "dd/MM/yyyy", label: "23/09/2026" },
                      { value: "yyyy-MM-dd", label: "2026-09-23" },
                    ]}
                  />
                )}
              />
            </Field>
            <Field label="Time format" htmlFor="timeFormat">
              <Controller
                control={control}
                name="timeFormat"
                render={({ field }) => (
                  <Select id="timeFormat" value={field.value} onValueChange={field.onChange} options={[{ value: "12h", label: "12-hour (2:30 PM)" }, { value: "24h", label: "24-hour (14:30)" }]} />
                )}
              />
            </Field>
          </div>
        </SettingsCard>
      </SettingsForm>
      <SettingsCard title="Appearance" description="Applies immediately and is remembered on this device.">
        <SettingRow label="Theme" description="Dark is tuned for long calling sessions.">
          <Segmented
            label="Theme"
            value={(theme as "dark" | "light" | "system") ?? "dark"}
            onValueChange={setTheme}
            options={[
              { value: "dark", label: "Dark", icon: <Moon /> },
              { value: "light", label: "Light", icon: <Sun /> },
              { value: "system", label: "System", icon: <Monitor /> },
            ]}
          />
        </SettingRow>
      </SettingsCard>
    </div>
  );
}
