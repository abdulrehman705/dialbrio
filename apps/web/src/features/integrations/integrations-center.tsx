"use client";

import * as React from "react";
import type { Integration } from "@dialbrio/types";
import { Plug, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/dialog";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { useIntegrations } from "@/lib/queries";
import { IntegrationRow } from "./integration-card";
import { IntegrationDrawer } from "./integration-drawer";
import { CATEGORY_COPY, CATEGORY_ORDER, PLANNED_INTEGRATIONS } from "./provider-meta";

function Tally({ items }: { items: Integration[] }) {
  const n = (f: (i: Integration) => boolean) => items.filter(f).length;
  const parts = [
    { label: "connected", value: n((i) => i.status === "connected") },
    { label: "need attention", value: n((i) => i.status === "needs_attention" || i.status === "error") },
    { label: "not set up", value: n((i) => i.status === "not_connected") },
  ];
  return (
    <p className="text-[13px] text-fg-muted">
      {parts.map((p, i) => (
        <React.Fragment key={p.label}>
          {i > 0 && <span aria-hidden> · </span>}
          <span className="font-mono text-fg">{p.value}</span> {p.label}
        </React.Fragment>
      ))}
    </p>
  );
}

/** Amber callout for anything that is actively hurting sync or monitoring. */
function AttentionCallout({ items, onOpen }: { items: Integration[]; onOpen: (p: string) => void }) {
  const broken = items.filter((i) => i.status === "needs_attention" || i.status === "error");
  if (!broken.length) return null;
  return (
    <div role="status" className="flex flex-col gap-3 rounded-lg border border-warning/50 bg-warning-soft px-4 py-3.5 sm:flex-row sm:items-start">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning-text" aria-hidden />
      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {broken.map((i) => {
          const issue = i.checks.find((c) => c.status === "error" || c.status === "warning");
          return (
            <li key={i.provider} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="min-w-0 text-[13px] text-fg">
                <span className="font-semibold">{i.name}:</span> {issue?.detail ?? "Needs attention."}
              </p>
              <Button variant="link" size="sm" className="text-warning-text" onClick={() => onOpen(i.provider)}>
                Review
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function IntegrationsCenter() {
  const { data, isLoading, isError, refetch } = useIntegrations();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const open = data?.find((i) => i.provider === openId);
  const groups = CATEGORY_ORDER.map((cat) => ({ cat, items: (data ?? []).filter((i) => i.category === cat) })).filter((g) => g.items.length);

  return (
    <Page>
      <PageHeader
        title="Integrations"
        description="GoHighLevel stays your system of record. DialBrio owns the calling, follow-up and the numbers."
        meta={data ? <Tally items={data} /> : null}
      />

      {isLoading ? (
        <div className="flex flex-col gap-6" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid gap-4 lg:grid-cols-[240px_1fr]">
              <Skeleton className="h-10" />
              <Skeleton className="h-24" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} description="Integration health could not be loaded. Calling is not affected." />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={Plug} title="No integrations available" description="Integrations for this sub-account will appear here." />
      ) : (
        <>
          <AttentionCallout items={data} onOpen={setOpenId} />
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {groups.map((g) => (
              <section key={g.cat} aria-labelledby={`cat-${g.cat}`} className="grid gap-3 py-6 lg:grid-cols-[240px_1fr] lg:gap-8">
                <div>
                  <h2 id={`cat-${g.cat}`} className="font-display text-base font-bold tracking-[-0.015em] text-fg">
                    {g.cat}
                  </h2>
                  <p className="mt-1 text-[13px] leading-5 text-fg-muted">{CATEGORY_COPY[g.cat]}</p>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
                  {g.items.map((i) => (
                    <li key={i.provider}>
                      <IntegrationRow integration={i} onOpen={() => setOpenId(i.provider)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <section aria-labelledby="cat-planned" className="grid gap-3 py-6 lg:grid-cols-[240px_1fr] lg:gap-8">
              <div>
                <h2 id="cat-planned" className="font-display text-base font-bold tracking-[-0.015em] text-fg">
                  On the roadmap
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-fg-muted">Not connectable yet. Native means two-way sync with no middleware.</p>
              </div>
              <ul className="flex flex-wrap content-start gap-2" aria-label="Planned integrations">
                {PLANNED_INTEGRATIONS.map((p) => (
                  <li
                    key={p.name}
                    className={
                      p.native
                        ? "rounded-full border border-brand/50 px-3 py-1.5 text-[13px] font-medium text-brand-text"
                        : "rounded-full border border-border-strong px-3 py-1.5 text-[13px] text-fg-secondary"
                    }
                  >
                    {p.name}
                    <span className="ml-1.5 text-xs text-fg-muted">{p.native ? "native · planned" : p.kind.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        {open && <IntegrationDrawer integration={open} />}
      </Sheet>
    </Page>
  );
}
