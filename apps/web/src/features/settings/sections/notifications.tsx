"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { SettingsCard, SettingsForm, useSettingsForm } from "../kit";

const EVENTS = [
  { id: "crm_sync_failed", label: "CRM sync failed", description: "An outcome could not be written to GoHighLevel" },
  { id: "number_at_risk", label: "Number at risk", description: "A caller ID is labeled spam or its answer rate drops" },
  { id: "queue_stale", label: "Queue going stale", description: "Leads wait longer than the queue's SLA" },
  { id: "callback_due", label: "Callback due", description: "A callback assigned to you is due" },
  { id: "inbound_sms", label: "Inbound SMS", description: "A contact replies to a conversation you own" },
  { id: "usage_limit", label: "Usage limit", description: "80% and 95% of plan limits" },
] as const;
const CHANNELS = [
  { id: "inApp", label: "In-app" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
] as const;

const channelSchema = z.object({ inApp: z.boolean(), email: z.boolean(), sms: z.boolean() });
const schema = z.object({ matrix: z.object(Object.fromEntries(EVENTS.map((e) => [e.id, channelSchema])) as Record<(typeof EVENTS)[number]["id"], typeof channelSchema>) });
type Values = z.infer<typeof schema>;

const off = { inApp: true, email: false, sms: false };
const defaults: Values = { matrix: Object.fromEntries(EVENTS.map((e) => [e.id, off])) as Values["matrix"] };

export function NotificationSettings() {
  const { form, ...rest } = useSettingsForm<Values>("notifications", schema, defaults);
  const { control } = form;

  return (
    <SettingsForm form={form} {...rest}>
      <SettingsCard title="Delivery" description="Choose where each event reaches you. Critical compliance alerts are always shown in-app.">
        <ul className="-mx-5 divide-y divide-border border-t border-border sm:hidden">
          {EVENTS.map((e) => (
            <li key={e.id} className="px-5 py-3">
              <p className="text-[13px] font-medium text-fg">{e.label}</p>
              <p className="text-xs text-fg-muted">{e.description}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                {CHANNELS.map((c) => (
                  <label key={c.id} className="flex min-h-11 items-center gap-2 text-[13px] text-fg-secondary">
                    <Controller
                      control={control}
                      name={`matrix.${e.id}.${c.id}`}
                      render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="-mx-5 overflow-x-auto max-sm:hidden">
          <table className="w-full min-w-[480px] border-separate border-spacing-0 text-[13px]">
            <caption className="sr-only">Notification channels per event</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-border px-5 pb-2 text-left text-xs font-medium text-fg-muted">
                  Event
                </th>
                {CHANNELS.map((c) => (
                  <th key={c.id} scope="col" className="w-20 border-b border-border px-2 pb-2 text-center text-xs font-medium text-fg-muted last:pr-5">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((e) => (
                <tr key={e.id}>
                  <th scope="row" className="border-b border-border px-5 py-3 text-left font-normal">
                    <span className="block font-medium text-fg">{e.label}</span>
                    <span className="block text-xs text-fg-muted">{e.description}</span>
                  </th>
                  {CHANNELS.map((c) => (
                    <td key={c.id} className="border-b border-border px-2 py-3 text-center last:pr-5">
                      <Controller
                        control={control}
                        name={`matrix.${e.id}.${c.id}`}
                        render={({ field }) => <Switch aria-label={`${c.label} for ${e.label}`} checked={field.value} onCheckedChange={field.onChange} />}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>
    </SettingsForm>
  );
}
