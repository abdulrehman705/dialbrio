"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarCheck,
  CircleCheck,
  Clock,
  History,
  Megaphone,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneMissed,
  RefreshCw,
  ScrollText,
  StickyNote,
  UserPlus,
} from "lucide-react";
import type { DialerLead, LeadStage, TimelineEvent } from "@dialbrio/types";
import { CRMStatus, LeadStateBadge } from "@/components/domain";
import { DISPOSITION_META } from "@/components/domain/status-config";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/input";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState, ErrorState } from "@/components/states";
import { useMe, usePlaybook } from "@/lib/queries";
import { cn, formatDateTime, formatListTime, formatPhone, timeAgo } from "@/lib/utils";
import { useDialerStore } from "./store";
import { useNow } from "./use-now";

const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  attempting: "Attempting",
  connected: "Connected",
  qualified: "Qualified",
  callback: "Callback",
  appointment: "Appointment",
  lost: "Lost",
  dnc: "Do not call",
};

function Section({ title, children, className, aside }: { title: string; children: React.ReactNode; className?: string; aside?: React.ReactNode }) {
  return (
    <section className={cn("flex flex-col gap-2 border-t border-border pt-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-fg">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)] items-baseline gap-3">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-[13px] text-fg-secondary">{children}</dd>
    </div>
  );
}

/** Minutes since the lead was created, when still inside the speed-to-lead window. */
function speedToLeadAge(createdAt: string, now: number) {
  const mins = Math.floor((now - new Date(createdAt).getTime()) / 60000);
  return mins >= 0 && mins < 10 ? mins : null;
}

/** Identity, lifecycle, why-this-lead, last conversation, CRM fields. */
export function LeadProfile({ lead }: { lead: DialerLead }) {
  const c = lead.contact;
  const name = `${c.firstName} ${c.lastName}`;
  const lastAttempt = lead.history.find((e) => e.kind === "no_answer" || e.kind === "connected");
  const now = useNow(c.leadState === "fresh", 15000);
  const stl = c.leadState === "fresh" ? speedToLeadAge(c.createdAt, now) : null;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <LeadStateBadge state={c.leadState} />
          <span className="text-xs text-fg-muted">{STAGE_LABEL[c.stage]}</span>
          {stl !== null && (
            <Tooltip content="New leads are called inside 10 minutes. Leads reached in the first 5 minutes convert best.">
              <span tabIndex={0} className="cursor-help rounded-[5px] bg-brand-soft px-2 py-0.5 font-mono text-[11px] text-brand-text">
                Speed-to-lead · {stl}m old
              </span>
            </Tooltip>
          )}
        </div>
        <p className="mt-2 font-display text-[24px] leading-7 font-bold tracking-[-0.03em] text-fg">{name}</p>
        <p className="mt-1 font-mono text-[15px] text-fg">{formatPhone(c.phone)}</p>
      </div>

      <dl className="flex flex-col gap-1.5">
        <Row label="Email">{c.email ?? <span className="text-fg-muted">None on file</span>}</Row>
        <Row label="Location">
          {c.city}, {c.state} <span className="text-fg-muted">· {c.timezone.split("/")[1]?.replace("_", " ")} time</span>
        </Row>
        <Row label="Source">
          {c.source} <span className="text-fg-muted">· {timeAgo(c.createdAt)}</span>
        </Row>
        <Row label="Campaign">{c.campaignName}</Row>
      </dl>

      <div className="rounded-lg bg-surface-sunken px-3 py-2.5">
        <p className="text-xs text-fg-muted">Why this lead is next</p>
        <p className="mt-0.5 text-[13px] leading-5 text-fg">{lead.queueReason}</p>
      </div>

      <Section title="Previous attempt" aside={<span className="text-xs text-fg-muted tabular">{c.attempts} total</span>}>
        {lastAttempt ? (
          <div className="flex items-baseline justify-between gap-2 text-[13px]">
            <span className={lastAttempt.kind === "connected" ? "text-fg" : "text-fg-secondary"}>{lastAttempt.title}</span>
            <span className="shrink-0 font-mono text-xs text-fg-muted">{formatListTime(lastAttempt.at)}</span>
          </div>
        ) : (
          <p className="text-[13px] text-fg-muted">First call to this lead.</p>
        )}
      </Section>

      {lead.lastConversation && (
        <Section title="Last conversation">
          <p className="text-xs text-fg-muted">
            {lead.lastConversation.agentName} · <span className="font-mono">{formatDateTime(lead.lastConversation.at)}</span>
            {lead.lastConversation.disposition && <> · {DISPOSITION_META[lead.lastConversation.disposition].label}</>}
          </p>
          {c.aiSummary && (
            <div className="rounded-lg bg-ai-soft px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ai-text">AI summary</p>
                <Tooltip content="Model confidence in this summary. Verify details with the contact.">
                  <span tabIndex={0} className="cursor-help rounded-sm font-mono text-[11px] text-ai-text">
                    {Math.round(c.aiSummary.confidence * 100)}%
                  </span>
                </Tooltip>
              </div>
              <p className="mt-1 text-[13px] leading-5 text-fg-secondary">{c.aiSummary.text}</p>
              <p className="mt-1 text-[11px] text-fg-muted">Generated {timeAgo(c.aiSummary.generatedAt)} · may be wrong, check before relying on it</p>
            </div>
          )}
        </Section>
      )}

      {!lead.lastConversation && c.aiSummary && (
        <Section title="AI summary" aside={<span className="font-mono text-[11px] text-ai-text">{Math.round(c.aiSummary.confidence * 100)}%</span>}>
          <p className="text-[13px] leading-5 text-fg-secondary">{c.aiSummary.text}</p>
          <p className="text-[11px] text-fg-muted">Generated {timeAgo(c.aiSummary.generatedAt)} · may be wrong, check before relying on it</p>
        </Section>
      )}

      <Section title="From GoHighLevel" aside={<CRMStatus state={c.crmSync} size="sm" />}>
        <dl className="flex flex-col gap-1.5">
          {Object.entries(c.customFields).map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 text-[13px]">
              <dt className="text-fg-muted">{k}</dt>
              <dd className="truncate text-right text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        {c.tags.length > 0 && <p className="text-xs text-fg-muted">Tags: {c.tags.join(", ")}</p>}
      </Section>
    </div>
  );
}

// ── Script / Notes / History ─────────────────────────────────────────────

const timelineIcon: Partial<Record<TimelineEvent["kind"], [React.ReactNode, TimelineItem["tone"]]>> = {
  lead_created: [<UserPlus key="i" />, "brand"],
  campaign_added: [<Megaphone key="i" />, "neutral"],
  call_attempt: [<Phone key="i" />, "neutral"],
  no_answer: [<PhoneMissed key="i" />, "neutral"],
  sms_sent: [<MessageSquare key="i" />, "neutral"],
  sms_received: [<MessageSquare key="i" />, "brand"],
  callback_scheduled: [<Clock key="i" />, "brand"],
  connected: [<PhoneCall key="i" />, "success"],
  qualified: [<CircleCheck key="i" />, "success"],
  appointment: [<CalendarCheck key="i" />, "success"],
  note: [<StickyNote key="i" />, "neutral"],
  state_changed: [<RefreshCw key="i" />, "warning"],
  crm_sync: [<RefreshCw key="i" />, "neutral"],
};

function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}

export function LeadWorkTabs({ lead, campaignId }: { lead: DialerLead; campaignId: string }) {
  const playbook = usePlaybook(campaignId);
  const { data: me } = useMe();
  const notes = useDialerStore((s) => s.notes);
  const set = useDialerStore((s) => s.set);
  const c = lead.contact;
  const vars = {
    first: c.firstName,
    city: c.city ?? "your area",
    agent: me?.user.name.split(" ")[0] ?? "your agent",
    bill: (c.customFields["Monthly bill"] ?? "").replace("$", "") || "—",
    slot: "the time you picked",
  };

  return (
    <Tabs defaultValue="script" className="flex min-h-0 flex-1 flex-col">
      <TabsList className="shrink-0 px-4 md:px-5">
        <TabsTrigger value="script">Script</TabsTrigger>
        <TabsTrigger value="notes">
          Notes
          {notes && <span className="size-1.5 rounded-full bg-brand" aria-label="has notes" />}
        </TabsTrigger>
        <TabsTrigger value="history">
          History
          <span className="font-mono text-[11px] text-fg-muted">{lead.history.length}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="script" className="min-h-0 flex-1 overflow-y-auto p-4 outline-none md:p-5">
        {playbook.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-12" />
              </div>
            ))}
          </div>
        ) : playbook.isError ? (
          <ErrorState compact title="Script unavailable" description="The playbook could not be loaded. You can still call and disposition." onRetry={() => playbook.refetch()} />
        ) : playbook.data ? (
          <article className="mx-auto flex max-w-[64ch] flex-col gap-6">
            <header>
              <p className="text-xs text-fg-muted">Playbook</p>
              <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-fg">{playbook.data.name}</h3>
            </header>
            <ol className="flex flex-col gap-5">
              {playbook.data.sections.map((sec, i) => (
                <li key={sec.id} className="grid grid-cols-[28px_1fr] gap-2">
                  <span className="pt-[3px] font-mono text-xs text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-[15px] font-bold tracking-[-0.01em] text-fg">{sec.title}</p>
                    <p className="mt-1 text-[15px] leading-7 whitespace-pre-line text-fg-secondary">{fill(sec.body, vars)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <section>
              <h3 className="mb-2 font-display text-[15px] font-bold tracking-[-0.01em] text-fg">If they say…</h3>
              <div className="divide-y divide-border border-y border-border">
                {playbook.data.objections.map((o) => (
                  <details key={o.objection} className="group">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-[14px] font-medium text-fg hover:text-brand-text [&::-webkit-details-marker]:hidden">
                      “{o.objection}”
                      <span className="font-mono text-fg-muted transition-transform group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <p className="pb-3 text-[14px] leading-6 text-fg-secondary">{o.response}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>
        ) : (
          <EmptyState compact icon={ScrollText} title="No script for this campaign" description="Managers can attach a playbook in campaign settings." />
        )}
      </TabsContent>

      <TabsContent value="notes" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 outline-none md:p-5">
        <label htmlFor="call-notes" className="text-xs font-medium text-fg-secondary">
          Call notes
        </label>
        <Textarea
          id="call-notes"
          value={notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder={`What did ${c.firstName} say? Objections, timing, decision makers…`}
          className="min-h-40 flex-1"
          aria-describedby="call-notes-desc"
        />
        <p id="call-notes-desc" className="text-xs text-fg-muted">
          Saved with the disposition and added as a note on the GoHighLevel contact.
        </p>
      </TabsContent>

      <TabsContent value="history" className="min-h-0 flex-1 overflow-y-auto p-4 outline-none md:p-5">
        {lead.history.length ? (
          <Timeline
            items={lead.history.map((e) => {
              const [icon, tone] = timelineIcon[e.kind] ?? [<Clock key="i" />, "neutral" as const];
              return { id: e.id, icon, tone, title: e.title, detail: [e.detail, e.actor].filter(Boolean).join(" · "), time: formatListTime(e.at) };
            })}
          />
        ) : (
          <EmptyState compact icon={History} title="No activity yet" description="Calls, messages and lifecycle changes will appear here." />
        )}
      </TabsContent>
    </Tabs>
  );
}

/** Animates lead swaps so the agent notices the next lead arrived. */
export function LeadSwap({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
