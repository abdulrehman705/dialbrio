"use client";

import { Copy, KeyRound, Plus, Webhook } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mono } from "@/components/ui/mono";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState, ErrorState } from "@/components/states";
import { useSettings } from "@/lib/queries";
import { DangerZone, SettingRow, SettingsCard } from "../kit";

interface DeveloperSettingsData {
  apiKeys: { id: string; name: string; prefix: string; scopes: string[]; createdAt: string; lastUsed: string }[];
  webhooks: { id: string; url: string; events: string[]; status: "healthy" | "failing"; secretLast4: string }[];
}

const INTAKE = [
  { label: "GoHighLevel", url: "https://api.dialbrio.com/webhooks/ghl" },
  { label: "Twilio voice", url: "https://api.dialbrio.com/webhooks/twilio/voice" },
  { label: "Twilio SMS", url: "https://api.dialbrio.com/webhooks/twilio/sms" },
];

function copy(text: string) {
  void navigator.clipboard?.writeText(text).then(
    () => toast.success("Copied"),
    () => toast.error("Could not copy"),
  );
}

function Phase1Button({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip content="Available when the API ships in Phase 1">
      <span tabIndex={0}>
        <Button size="sm" disabled>
          {children}
        </Button>
      </span>
    </Tooltip>
  );
}

export function DeveloperSettings() {
  const { data, isLoading, isError, refetch } = useSettings("developer");
  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;
  const d = data as unknown as DeveloperSettingsData;

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        title="API keys"
        description="Keys are shown once at creation. Only the prefix is stored for display."
        actions={
          <Phase1Button>
            <Plus /> Create key
          </Phase1Button>
        }
      >
        {d.apiKeys.length === 0 ? (
          <EmptyState compact icon={KeyRound} title="No API keys" description="Create a key to access the DialBrio API." />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {d.apiKeys.map((k) => (
              <li key={k.id} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-fg">{k.name}</p>
                  <p className="text-xs text-fg-muted">
                    <Mono>{k.prefix}••••••••••••</Mono> · {k.scopes.join(", ")}
                  </p>
                </div>
                <p className="text-xs text-fg-muted">
                  Created <Mono>{k.createdAt}</Mono> · last used {k.lastUsed}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>

      <SettingsCard
        title="Outbound webhooks"
        description="DialBrio signs every delivery with HMAC-SHA256. Verify the X-DialBrio-Signature header."
        actions={
          <Phase1Button>
            <Plus /> Add endpoint
          </Phase1Button>
        }
      >
        {d.webhooks.length === 0 ? (
          <EmptyState compact icon={Webhook} title="No endpoints" description="Send call and disposition events to your systems." />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {d.webhooks.map((w) => (
              <li key={w.id} className="flex flex-col gap-1.5 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Mono className="min-w-0 truncate text-[13px] text-fg">{w.url}</Mono>
                  <Badge tone={w.status === "healthy" ? "success" : "danger"} size="sm">
                    {w.status === "healthy" ? "Delivering" : "Failing · retrying"}
                  </Badge>
                </div>
                <p className="text-xs text-fg-muted">
                  {w.events.map((e) => (
                    <Mono key={e} className="mr-2">
                      {e}
                    </Mono>
                  ))}
                </p>
                <p className="text-xs text-fg-muted">
                  Signing secret <Mono>whsec_••••••••{w.secretLast4}</Mono>
                </p>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>

      <SettingsCard title="Inbound webhook URLs" description="Configure these in the provider consoles. Requests are signature-verified and deduplicated.">
        {INTAKE.map((i) => (
          <SettingRow key={i.url} label={i.label} description={<Mono className="break-all">{i.url}</Mono>}>
            <Button size="xs" variant="ghost" aria-label={`Copy ${i.label} webhook URL`} onClick={() => copy(i.url)}>
              <Copy /> Copy
            </Button>
          </SettingRow>
        ))}
      </SettingsCard>

      <DangerZone>
        <SettingRow label="Revoke all API keys" description="Every integration using a key stops working immediately.">
          <Phase1Button>Revoke all</Phase1Button>
        </SettingRow>
      </DangerZone>
    </div>
  );
}
