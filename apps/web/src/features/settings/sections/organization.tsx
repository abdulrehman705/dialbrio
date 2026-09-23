"use client";

import { Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mono } from "@/components/ui/mono";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { useMe } from "@/lib/queries";
import { DangerZone, PlannedCard, SettingRow, SettingsCard, SettingsForm, useSettingsForm } from "../kit";

const schema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters"),
  legalName: z.string().trim().max(120),
  supportEmail: z.email("Enter a valid email"),
});
type Values = z.infer<typeof schema>;

export function OrganizationSettings() {
  const { data: me, isLoading } = useMe();
  const { form, ...rest } = useSettingsForm<Values>("organization", schema, { name: "", legalName: "", supportEmail: "" });
  const { register, formState } = form;

  return (
    <div className="flex flex-col gap-4">
      <SettingsForm form={form} {...rest}>
        <SettingsCard title="Organization details" description="Shown on invoices and in client-facing notifications.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Organization name" htmlFor="name" error={formState.errors.name?.message}>
              <Input id="name" aria-describedby="name-desc" {...register("name")} />
            </Field>
            <Field label="Legal name" htmlFor="legalName" optional>
              <Input id="legalName" {...register("legalName")} />
            </Field>
            <Field label="Support email" htmlFor="supportEmail" error={formState.errors.supportEmail?.message} className="md:col-span-2">
              <Input id="supportEmail" type="email" aria-describedby="supportEmail-desc" {...register("supportEmail")} />
            </Field>
          </div>
        </SettingsCard>
      </SettingsForm>
      <SettingsCard title="Sub-accounts" description="Each sub-account maps to one GoHighLevel location. Data never crosses sub-accounts.">
        {isLoading || !me ? (
          <Skeleton className="h-28" />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {me.subAccounts.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-[13px] font-medium text-fg">{s.name}</span>
                <span className="flex items-center gap-3 text-xs text-fg-muted">
                  {s.timezone}
                  <Mono>{s.crmLocationId}</Mono>
                </span>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>
      <PlannedCard
        title="White-label portal"
        phase="Phase 7"
        description="Clients log into your calling platform on your domain and never see the DialBrio name. Included on the Agency plan, not sold as an add-on."
        points={["Your logo and colors on the portal", "Custom domain with managed TLS", "Branded emails and SMS sender names", "Per-client login pages"]}
      />
      <DangerZone>
        <SettingRow label="Delete organization" description="Removes all sub-accounts, contacts, recordings and history after a 30-day hold. Contact support to start.">
          <Tooltip content="Requires support verification">
            <span tabIndex={0}>
              <Button variant="danger-soft" size="sm" disabled>
                <Trash2 /> Delete organization
              </Button>
            </span>
          </Tooltip>
        </SettingRow>
      </DangerZone>
    </div>
  );
}
