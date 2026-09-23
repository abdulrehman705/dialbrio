"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ban,
  CalendarCheck,
  CalendarDays,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  Clock,
  Database,
  MessageSquare,
  MessageSquareReply,
  Megaphone,
  PhoneCall,
  PhoneMissed,
  PhoneOutgoing,
  RefreshCw,
  StickyNote,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { Contact, TimelineEventKind } from "@dialbrio/types";
import { useAppointments, useContact, useContactCalls, useContactTimeline, useConversations } from "@/lib/queries";
import { Sheet, SheetContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mono } from "@/components/ui/mono";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/input";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { Progress } from "@/components/ui/progress";
import { AppointmentCard } from "@/components/domain/appointment-card";
import { CRMStatus, DispositionBadge, LeadStateBadge } from "@/components/domain";
import { EmptyState, ErrorState } from "@/components/states";
import { cn, formatDateTime, formatDuration, formatListTime, formatPhone, timeAgo } from "@/lib/utils";
import { NextActionLabel, STAGE_LABEL } from "./shared";

const TIMELINE_META: Record<TimelineEventKind, { icon: LucideIcon; tone: TimelineItem["tone"] }> = {
  lead_created: { icon: UserPlus, tone: "brand" },
  campaign_added: { icon: Megaphone, tone: "neutral" },
  call_attempt: { icon: PhoneOutgoing, tone: "neutral" },
  no_answer: { icon: PhoneMissed, tone: "neutral" },
  sms_sent: { icon: MessageSquare, tone: "neutral" },
  sms_received: { icon: MessageSquareReply, tone: "brand" },
  callback_scheduled: { icon: Clock, tone: "warning" },
  connected: { icon: PhoneCall, tone: "success" },
  qualified: { icon: CircleCheck, tone: "success" },
  appointment: { icon: CalendarCheck, tone: "success" },
  note: { icon: StickyNote, tone: "neutral" },
  state_changed: { icon: RefreshCw, tone: "warning" },
  crm_sync: { icon: Database, tone: "neutral" },
};

const consentMeta = {
  granted: { label: "Consent granted", tone: "success" as const, icon: CircleCheck },
  unknown: { label: "Consent unknown", tone: "neutral" as const, icon: CircleHelp },
  revoked: { label: "Consent revoked", tone: "danger" as const, icon: Ban },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-2 text-[13px]">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-fg">{children}</dd>
    </div>
  );
}

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-2">
      <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-fg">{children}</h3>
      {aside}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}

function ProfileTab({ c }: { c: Contact }) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle>Contact</SectionTitle>
        <dl className="divide-y divide-border">
          <Row label="Phone">
            <Mono>{formatPhone(c.phone)}</Mono>
          </Row>
          <Row label="Email">{c.email ?? <span className="text-fg-muted">Not provided</span>}</Row>
          <Row label="Location">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</Row>
          <Row label="Time zone">
            <Mono>{c.timezone}</Mono>
          </Row>
        </dl>
      </section>
      <section>
        <SectionTitle>DialBrio</SectionTitle>
        <dl className="divide-y divide-border">
          <Row label="Lifecycle">
            <LeadStateBadge state={c.leadState} />
          </Row>
          <Row label="Stage">{STAGE_LABEL[c.stage]}</Row>
          <Row label="Campaign">{c.campaignName ?? "—"}</Row>
          <Row label="Owner">{c.ownerName ?? "Unassigned"}</Row>
          <Row label="Source">{c.source}</Row>
          <Row label="Attempts">
            <span className="tabular">{c.attempts}</span>
          </Row>
          <Row label="Last contact">{c.lastContactAt ? `${timeAgo(c.lastContactAt)}` : "Never"}</Row>
          <Row label="Next action">
            <NextActionLabel action={c.nextAction} />
          </Row>
          <Row label="Created">
            <Mono>{formatDateTime(c.createdAt)}</Mono>
          </Row>
        </dl>
      </section>
      <section>
        <SectionTitle aside={<CRMStatus state={c.crmSync} size="sm" />}>From GoHighLevel</SectionTitle>
        <dl className="divide-y divide-border">
          {Object.entries(c.customFields).map(([k, v]) => (
            <Row key={k} label={k}>
              {v}
            </Row>
          ))}
          <Row label="Tags">{c.tags.length ? c.tags.join(", ") : <span className="text-fg-muted">None</span>}</Row>
        </dl>
        <p className="mt-2 text-xs text-fg-muted">GoHighLevel is the source of truth for these fields. Edit them there and they sync back. Lifecycle is tracked by DialBrio, not by tags.</p>
      </section>
    </div>
  );
}

function TimelineTab({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useContactTimeline(id);
  if (isLoading) return <ListSkeleton />;
  if (isError) return <ErrorState compact onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState compact icon={Clock} title="No activity yet" description="Calls, messages and lifecycle changes will appear here." />;
  // Chronological (oldest first) so the lifecycle chain reads top to bottom.
  const items: TimelineItem[] = [...data].reverse().map((e) => {
    const m = TIMELINE_META[e.kind];
    const Icon = m.icon;
    return {
      id: e.id,
      icon: <Icon aria-hidden />,
      tone: m.tone,
      title: e.title,
      detail: [e.detail, e.actor && `by ${e.actor}`].filter(Boolean).join(" · "),
      time: formatListTime(e.at),
    };
  });
  return <Timeline items={items} />;
}

function CallsTab({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useContactCalls(id);
  if (isLoading) return <ListSkeleton />;
  if (isError) return <ErrorState compact onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState compact icon={PhoneOutgoing} title="No calls yet" description="This contact hasn't been called." />;
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {data.map((call) => (
        <li key={call.id} className="flex items-center gap-3 p-3">
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", call.durationSec ? "bg-success-soft text-success-text" : "bg-surface-sunken text-fg-muted")}>
            {call.durationSec ? <PhoneCall className="size-4" aria-hidden /> : <PhoneMissed className="size-4" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-fg">
              {call.direction === "outbound" ? "Outbound" : "Inbound"} · {call.agentName ?? "Unknown agent"}
            </p>
            <p className="text-xs text-fg-muted">
              <Mono>{formatDateTime(call.startedAt)}</Mono> · from <Mono>{formatPhone(call.fromNumber)}</Mono>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {call.disposition && <DispositionBadge code={call.disposition} size="sm" />}
            <Mono className="text-xs text-fg-muted">{call.durationSec ? formatDuration(call.durationSec) : "0s"}</Mono>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MessagesTab({ c }: { c: Contact }) {
  const { data, isLoading, isError, refetch } = useConversations("all");
  if (isLoading) return <ListSkeleton />;
  if (isError) return <ErrorState compact onRetry={() => refetch()} />;
  const conv = data?.find((x) => x.contactId === c.id);
  if (!conv)
    return (
      <EmptyState
        compact
        icon={MessageSquare}
        title="No messages yet"
        description="Start an SMS conversation from the Conversations inbox."
        action={
          <Button asChild size="sm">
            <Link href="/app/conversations">Open inbox</Link>
          </Button>
        }
      />
    );
  return (
    <Link href={`/app/conversations?id=${conv.id}`} className="block rounded-lg border border-border p-4 transition-colors hover:bg-surface-hover">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-fg">SMS conversation</span>
        <Mono className="text-xs text-fg-muted">{formatListTime(conv.lastMessageAt)}</Mono>
      </div>
      <p className="mt-1 line-clamp-2 text-[13px] text-fg-secondary">{conv.lastMessagePreview}</p>
      <p className="mt-2 text-xs text-fg-muted">
        {conv.assigneeName ? `Assigned to ${conv.assigneeName}` : "Unassigned"} · via <Mono>{formatPhone(conv.numberUsed)}</Mono>
        {conv.unreadCount > 0 && ` · ${conv.unreadCount} unread`}
      </p>
    </Link>
  );
}

function AppointmentsTab({ c }: { c: Contact }) {
  const { data, isLoading, isError, refetch } = useAppointments();
  if (isLoading) return <ListSkeleton />;
  if (isError) return <ErrorState compact onRetry={() => refetch()} />;
  const appts = (data ?? []).filter((a) => a.contactId === c.id);
  if (!appts.length) return <EmptyState compact icon={CalendarDays} title="No appointments" description="Appointments booked from the dialer appear here, synced to the GoHighLevel calendar." />;
  return (
    <div className="flex flex-col gap-2">
      {appts.map((a) => (
        <AppointmentCard key={a.id} appt={a} />
      ))}
    </div>
  );
}

function NotesTab() {
  const [note, setNote] = React.useState("");
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="contact-note" className="text-xs font-medium text-fg-secondary">
        Draft a note
      </label>
      <Textarea id="contact-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should the next person know about this lead?" rows={5} aria-describedby="contact-note-desc" />
      <p id="contact-note-desc" className="text-xs text-fg-muted">
        Saving notes and syncing them to GoHighLevel ships in Phase 4. Until then, notes captured during a call on the Dialer are the record of truth.
      </p>
      <div>
        <Button size="sm" disabled>
          <StickyNote /> Save note
        </Button>
      </div>
    </div>
  );
}

function AiTab({ c }: { c: Contact }) {
  if (!c.aiSummary)
    return <EmptyState compact icon={CircleDashed} title="No AI summary" description="Summaries are generated after a connected call when an AI provider is connected." />;
  const pct = Math.round(c.aiSummary.confidence * 100);
  return (
    <div className="rounded-lg bg-ai-soft p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-ai-text">AI summary</span>
        <span className="font-mono text-xs text-ai-text">{pct}% confidence</span>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-fg">{c.aiSummary.text}</p>
      <Progress value={pct} tone="ai" label="Summary confidence" className="mt-4" />
      <p className="mt-3 text-xs text-fg-muted">
        Generated {timeAgo(c.aiSummary.generatedAt)} · <Mono>{c.aiSummary.model}</Mono>
      </p>
      <p className="mt-2 text-xs text-fg-muted">Treat this as a suggestion and check it before acting. AI never changes lifecycle, dispositions or compliance state.</p>
    </div>
  );
}

function DrawerHeader({ c }: { c: Contact }) {
  const name = `${c.firstName} ${c.lastName}`;
  const consent = consentMeta[c.consent];
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <LeadStateBadge state={c.leadState} size="sm" />
        <span className="text-xs text-fg-muted">{STAGE_LABEL[c.stage]}</span>
      </div>
      <p className="mt-1.5 truncate font-display text-[22px] leading-7 font-bold tracking-[-0.03em] text-fg">{name}</p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-fg-muted">
        <Mono className="text-fg">{formatPhone(c.phone)}</Mono>
        <span aria-hidden>·</span>
        <span className={cn(consent.tone === "danger" && "text-danger-text", consent.tone === "success" && "text-fg-secondary")}>{consent.label}</span>
      </p>
    </div>
  );
}

export function ContactDrawer({ contactId, onClose }: { contactId: string | null; onClose: () => void }) {
  const { data: c, isLoading, isError, refetch } = useContact(contactId);
  const [tab, setTab] = React.useState("profile");
  React.useEffect(() => setTab("profile"), [contactId]);
  const blocked = c?.stage === "dnc" || c?.consent === "revoked";

  return (
    <Sheet open={!!contactId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        title={c ? `${c.firstName} ${c.lastName}` : "Contact"}
        description="Contact details"
        header={c ? <DrawerHeader c={c} /> : isLoading ? <Skeleton className="h-16 w-64" /> : undefined}
        className="max-w-2xl"
      >
        {isError ? (
          <ErrorState onRetry={() => refetch()} title="Contact not found" description="It may have been deleted in GoHighLevel or you may not have access." />
        ) : !c ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-9" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3">
              {blocked ? (
                <Button variant="secondary" disabled title="Blocked by compliance">
                  <Ban /> Calling blocked (DNC)
                </Button>
              ) : (
                <Button asChild variant="success">
                  <Link href="/app/dialer">
                    <PhoneCall /> Call
                  </Link>
                </Button>
              )}
              {blocked ? (
                <Button variant="secondary" disabled>
                  <MessageSquare /> SMS
                </Button>
              ) : (
                <Button asChild variant="secondary">
                  <Link href="/app/conversations">
                    <MessageSquare /> SMS
                  </Link>
                </Button>
              )}
            </div>
            <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
              <TabsList className="px-3" aria-label="Contact sections">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="timeline">Activity</TabsTrigger>
                <TabsTrigger value="calls">Calls</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="ai">AI summary</TabsTrigger>
              </TabsList>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <TabsContent value="profile">
                  <ProfileTab c={c} />
                </TabsContent>
                <TabsContent value="timeline">
                  <TimelineTab id={c.id} />
                </TabsContent>
                <TabsContent value="calls">
                  <CallsTab id={c.id} />
                </TabsContent>
                <TabsContent value="messages">
                  <MessagesTab c={c} />
                </TabsContent>
                <TabsContent value="appointments">
                  <AppointmentsTab c={c} />
                </TabsContent>
                <TabsContent value="notes">
                  <NotesTab />
                </TabsContent>
                <TabsContent value="ai">
                  <AiTab c={c} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
