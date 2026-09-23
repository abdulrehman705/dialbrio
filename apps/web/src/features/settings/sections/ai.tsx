"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
import { Plug, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { IntegrationStatus } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useIntegrations } from "@/lib/queries";
import { SettingRow, SettingsCard, SettingsForm, useSettingsForm } from "../kit";

const schema = z.object({
  provider: z.enum(["none", "anthropic", "openai", "azure_openai", "google"]),
  callSummaries: z.boolean(),
  intentDetection: z.boolean(),
  qaScoring: z.boolean(),
  suggestDispositions: z.boolean(),
});
type Values = z.infer<typeof schema>;
const defaults: Values = { provider: "none", callSummaries: false, intentDetection: false, qaScoring: false, suggestDispositions: false };

const FEATURES = [
  { id: "callSummaries", label: "Call summaries", description: "Summary with confidence on every recorded call." },
  { id: "intentDetection", label: "Intent detection", description: "Structured intent (callback, interested, DNC request…) with confidence." },
  { id: "qaScoring", label: "QA scoring", description: "Score calls against the campaign playbook in AI QA." },
  { id: "suggestDispositions", label: "Suggested dispositions", description: "Pre-select a disposition for the agent to confirm. Never auto-applied." },
] as const;

export function AiSettings() {
  const integrations = useIntegrations();
  const llm = integrations.data?.find((i) => i.provider === "llm");
  const connected = llm?.status === "connected";
  const { form, ...rest } = useSettingsForm<Values>("ai", schema, defaults);
  const { control } = form;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-text" aria-hidden />
        <p className="text-[13px] leading-5 text-fg-secondary">
          AI assists; it never decides. AI output is structured, shows confidence, and <span className="font-medium text-fg">never overrides compliance</span> or
          changes a disposition without an agent confirming it. If the provider fails, calling continues normally.
        </p>
      </div>
      <SettingsForm form={form} {...rest}>
        <SettingsCard
          title="Provider"
          description="DialBrio is provider-agnostic. Credentials are managed in Integrations."
          actions={integrations.isLoading ? <Skeleton className="h-5 w-24" /> : llm && <IntegrationStatus status={llm.status} size="sm" />}
        >
          <SettingRow label="Language model provider" htmlFor="provider">
            <Controller
              control={control}
              name="provider"
              render={({ field }) => (
                <Select
                  id="provider"
                  className="sm:w-56"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: "none", label: "Not configured" },
                    { value: "anthropic", label: "Anthropic" },
                    { value: "openai", label: "OpenAI" },
                    { value: "azure_openai", label: "Azure OpenAI" },
                    { value: "google", label: "Google" },
                  ]}
                />
              )}
            />
          </SettingRow>
          {!connected && !integrations.isLoading && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-sunken px-3 py-2.5">
              <p className="text-xs text-fg-muted">Connect the AI provider in Integrations to enable the features below.</p>
              <Button asChild size="xs">
                <Link href="/app/integrations">
                  <Plug /> Open integrations
                </Link>
              </Button>
            </div>
          )}
        </SettingsCard>
        <SettingsCard title="Features" description="Each feature can be enabled independently.">
          {FEATURES.map((f) => (
            <SettingRow key={f.id} label={f.label} description={f.description} htmlFor={f.id}>
              <Controller
                control={control}
                name={f.id}
                render={({ field }) => <Switch id={f.id} aria-label={f.label} disabled={!connected} checked={connected && field.value} onCheckedChange={field.onChange} />}
              />
            </SettingRow>
          ))}
        </SettingsCard>
      </SettingsForm>
    </div>
  );
}
