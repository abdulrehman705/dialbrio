"use client";

import * as React from "react";
import type { Integration } from "@dialbrio/types";
import { KeyRound, Link2, LockKeyhole, RefreshCw, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { ComplianceStatus, IntegrationStatus } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/label";
import { Mono } from "@/components/ui/mono";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { useContacts, useMe, usePhoneNumbers } from "@/lib/queries";
import { cn, formatDateTime, formatPhone, timeAgo } from "@/lib/utils";
import { CHECK_META, PROVIDER_META } from "./provider-meta";

function Section({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-3 border-b border-border px-5 py-5 last:border-b-0", className)}>
      <div>
        <h3 className="text-[13px] font-semibold text-fg">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-[13px]">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right text-fg">{children}</dd>
    </div>
  );
}

const phase1Notice = (name: string) =>
  toast(`${name} connections arrive in Phase 1`, {
    description: "Credentials are exchanged and stored encrypted on the server — they are never sent to or shown in the browser.",
  });

function HealthChecks({ integration }: { integration: Integration }) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {integration.checks.map((c) => {
        const m = CHECK_META[c.status];
        return (
          <li key={c.label} className="flex items-start gap-3 px-3 py-2.5">
            <m.icon className={cn("mt-0.5 size-4 shrink-0", m.className)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-[13px] font-medium text-fg">
                {c.label}
                <span className={cn("text-xs font-normal", m.className)}>{m.label}</span>
              </p>
              <p className="mt-0.5 text-xs text-fg-muted">{c.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function GhlSections({ integration }: { integration: Integration }) {
  const { data: me } = useMe();
  const [location, setLocation] = React.useState<string>();
  // Contacts whose last CRM sync failed — the real API exposes these via /integrations/ghl/sync-errors.
  const failed = useContacts({ page: 1, pageSize: 240 });
  const errors = (failed.data?.items ?? []).filter((c) => c.crmSync === "failed").slice(0, 3);
  const [retrying, setRetrying] = React.useState<string | null>(null);

  const locations = (me?.subAccounts ?? []).filter((s) => s.crmLocationId);
  const selected = location ?? locations.find((l) => l.id === me?.activeSubAccountId)?.crmLocationId;

  return (
    <>
      <Section title="Authorization" description="OAuth grant used for contact, note, tag and calendar access.">
        <dl>
          <Row label="Status">
            <span className="inline-flex items-center gap-1.5 text-success-text">
              <LockKeyhole className="size-3.5" aria-hidden /> Authorized
            </span>
          </Row>
          <Row label="Access token">
            <Mono className="text-fg-muted">••••••••••••••••</Mono>
          </Row>
          <Row label="Scopes">contacts, notes, tags, calendars, webhooks</Row>
        </dl>
        <Button size="sm" className="self-start" onClick={() => phase1Notice("GoHighLevel")}>
          <RotateCw /> Reconnect
        </Button>
      </Section>

      <Section title="Location" description="The GHL location this sub-account syncs with. One location per sub-account.">
        <Field label="Connected location" htmlFor="ghl-location" hint="Changing the location re-runs the initial contact sync.">
          <Select
            id="ghl-location"
            value={selected}
            onValueChange={(v) => {
              setLocation(v);
              toast("Location change requires confirmation", { description: "Switching locations is applied by the API in Phase 1 with a re-sync preview." });
            }}
            options={locations.map((l) => ({ value: l.crmLocationId!, label: l.name, description: l.crmLocationId }))}
          />
        </Field>
      </Section>

      <Section title="Sync" description="Webhook intake and outcome sync back to the CRM.">
        <dl>
          <Row label="Last sync">{integration.lastSyncAt ? `${timeAgo(integration.lastSyncAt)} · ${formatDateTime(integration.lastSyncAt)}` : "Never"}</Row>
          <Row label="Webhook health">{integration.checks.find((c) => c.label === "Webhook delivery")?.detail ?? "Unknown"}</Row>
          {integration.metrics?.map((m) => (
            <Row key={m.label} label={m.label}>
              <span className="tabular">{m.value}</span>
            </Row>
          ))}
        </dl>
      </Section>

      <Section title="Sync errors" description="Outcomes that failed to write back. They retry automatically; you can retry now after fixing the cause.">
        {failed.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : failed.isError ? (
          <ErrorState compact onRetry={() => failed.refetch()} />
        ) : errors.length === 0 ? (
          <EmptyState compact icon={RefreshCw} title="No sync errors" description="Every outcome in the last 24 hours reached GoHighLevel." />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {errors.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-fg">
                    {c.firstName} {c.lastName} <Mono className="ml-1 text-xs text-fg-muted">{formatPhone(c.phone)}</Mono>
                  </p>
                  <p className="mt-0.5 text-xs text-danger-text">Custom field “Monthly bill” expects a number; received text.</p>
                </div>
                <Button
                  size="xs"
                  loading={retrying === c.id}
                  onClick={() => {
                    setRetrying(c.id);
                    setTimeout(() => {
                      setRetrying(null);
                      toast.success("Retry queued", { description: `${c.firstName} ${c.lastName} will sync on the next run.` });
                    }, 500);
                  }}
                >
                  <RefreshCw /> Retry
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function TwilioSections({ integration }: { integration: Integration }) {
  const numbers = usePhoneNumbers();
  const list = numbers.data ?? [];
  const a2pPending = list.filter((n) => n.a2p !== "approved").length;
  const attestA = list.filter((n) => n.stirShaken === "A").length;
  const check = (label: string) => integration.checks.find((c) => c.label === label);

  return (
    <>
      <Section title="Account" description="Twilio credentials are held server-side only.">
        <dl>
          <Row label="Account SID">
            <Mono>{integration.connectedAccount ?? "—"}</Mono>
          </Row>
          <Row label="Auth token">
            <Mono className="text-fg-muted">••••••••••••••••</Mono>
          </Row>
        </dl>
        <Button size="sm" className="self-start" onClick={() => phase1Notice("Twilio")}>
          <KeyRound /> Rotate credentials
        </Button>
      </Section>
      <Section title="Capabilities">
        {numbers.isLoading ? (
          <Skeleton className="h-28" />
        ) : numbers.isError ? (
          <ErrorState compact onRetry={() => numbers.refetch()} />
        ) : (
          <dl>
            <Row label="Numbers">
              <span className="tabular">{list.length} ({list.filter((n) => n.status === "active").length} active)</span>
            </Row>
            <Row label="Voice">{check("Voice")?.detail}</Row>
            <Row label="SMS">{check("SMS")?.detail}</Row>
            <Row label="A2P 10DLC">
              <ComplianceStatus status={a2pPending ? "pending" : "approved"} size="sm" label={a2pPending ? `${a2pPending} pending` : "Approved"} />
            </Row>
            <Row label="STIR/SHAKEN">
              <span className="tabular">A attestation on {attestA} of {list.length}</span>
            </Row>
            <Row label="Status webhooks">{check("Status webhooks")?.detail}</Row>
          </dl>
        )}
      </Section>
    </>
  );
}

export function IntegrationDrawer({ integration }: { integration: Integration }) {
  const meta = PROVIDER_META[integration.provider];
  const notConnected = integration.status === "not_connected";

  return (
    <SheetContent
      title={integration.name}
      description={integration.description}
      header={
        <div className="min-w-0">
          <p className="font-mono text-xs text-fg-muted">{integration.category}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="font-display text-xl font-bold tracking-[-0.02em] text-fg">{integration.name}</p>
            <IntegrationStatus status={integration.status} size="sm" />
          </div>
          <p className="mt-1 text-[13px] text-fg-muted">{integration.description}</p>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {notConnected ? (
          <Section title="What this enables">
            <ul className="flex flex-col gap-2">
              {meta.enables.map((e) => (
                <li key={e} className="flex items-start gap-2 text-[13px] text-fg-secondary">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  {e}
                </li>
              ))}
            </ul>
            <p className="text-xs text-fg-muted">Connection method: {meta.connectMethod}.</p>
            {!integration.required && <p className="text-xs text-fg-muted">Optional. Calling, SMS and CRM sync work without it.</p>}
          </Section>
        ) : null}

        <Section title="Health checks">
          <HealthChecks integration={integration} />
        </Section>

        {integration.provider === "ghl" && <GhlSections integration={integration} />}
        {integration.provider === "twilio" && <TwilioSections integration={integration} />}

        {integration.provider !== "ghl" && integration.provider !== "twilio" && integration.metrics && (
          <Section title="Metrics">
            <dl>
              {integration.metrics.map((m) => (
                <Row key={m.label} label={m.label}>
                  {m.value}
                </Row>
              ))}
            </dl>
          </Section>
        )}

        <p className="flex items-start gap-2 px-5 py-4 text-xs text-fg-muted">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Secrets are encrypted at rest and never sent to the browser. Values shown here are masked.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        {notConnected ? (
          <Button variant="primary" onClick={() => phase1Notice(integration.name)}>
            <Link2 /> Connect {integration.name}
          </Button>
        ) : integration.status === "error" ? (
          <Button variant="primary" onClick={() => phase1Notice(integration.name)}>
            <KeyRound /> Update credentials
          </Button>
        ) : integration.status === "needs_attention" && integration.provider === "ghl" ? (
          <Button variant="primary" onClick={() => toast.success("Retry queued", { description: "All failed outcomes will sync on the next run." })}>
            <RefreshCw /> Retry all failed syncs
          </Button>
        ) : (
          <Button onClick={() => toast("Health checks refreshed", { description: "All checks re-run against the provider." })}>
            <RefreshCw /> Re-run checks
          </Button>
        )}
      </div>
    </SheetContent>
  );
}
