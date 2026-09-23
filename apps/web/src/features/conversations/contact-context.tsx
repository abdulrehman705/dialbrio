"use client";

import Link from "next/link";
import { ArrowUpRight, PhoneCall, PhoneMissed } from "lucide-react";
import type { Conversation } from "@dialbrio/types";
import { useContact, useContactCalls } from "@/lib/queries";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mono } from "@/components/ui/mono";
import { Skeleton } from "@/components/ui/skeleton";
import { CRMStatus, DispositionBadge, LeadStateBadge } from "@/components/domain";
import { ErrorState } from "@/components/states";
import { formatDuration, formatListTime, formatPhone, initials, timeAgo } from "@/lib/utils";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-[13px]">
      <dt className="shrink-0 text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-right text-fg">{children}</dd>
    </div>
  );
}

/** Contact context for the active conversation. */
export function ContactContext({ conversation }: { conversation: Conversation }) {
  const contact = useContact(conversation.contactId);
  const calls = useContactCalls(conversation.contactId);
  const c = contact.data;

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={conversation.contactName} initials={initials(conversation.contactName)} size="xl" />
        <div>
          <p className="text-sm font-semibold text-fg">{conversation.contactName}</p>
          <Mono className="text-xs text-fg-secondary">{formatPhone(conversation.contactPhone)}</Mono>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <LeadStateBadge state={conversation.leadState} size="sm" />
          {c && <CRMStatus state={c.crmSync} size="sm" />}
        </div>
      </div>

      <section>
        <h3 className="mb-1 font-display text-[14px] font-bold tracking-[-0.01em] text-fg">Details</h3>
        {contact.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        ) : contact.isError ? (
          <ErrorState compact onRetry={() => contact.refetch()} description="Contact details unavailable." />
        ) : (
          <dl className="divide-y divide-border">
            <Row label="Email">{c?.email ?? "—"}</Row>
            <Row label="Campaign">{conversation.campaignName ?? "—"}</Row>
            <Row label="Assignee">{conversation.assigneeName ?? "Unassigned"}</Row>
            <Row label="Number used">
              <Mono>{formatPhone(conversation.numberUsed)}</Mono>
            </Row>
            {c && <Row label="Attempts">{c.attempts}</Row>}
            {c?.lastContactAt && <Row label="Last contact">{timeAgo(c.lastContactAt)}</Row>}
            {c?.nextAction && <Row label="Next action">{c.nextAction.label}</Row>}
          </dl>
        )}
      </section>

      <section>
        <h3 className="mb-2 font-display text-[14px] font-bold tracking-[-0.01em] text-fg">Recent calls</h3>
        {calls.isLoading ? (
          <Skeleton className="h-16" />
        ) : !calls.data?.length ? (
          <p className="text-[13px] text-fg-muted">No calls yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {calls.data.slice(0, 4).map((call) => (
              <li key={call.id} className="flex items-center gap-2 text-[13px]">
                {call.durationSec ? <PhoneCall className="size-3.5 text-success-text" aria-hidden /> : <PhoneMissed className="size-3.5 text-fg-muted" aria-hidden />}
                <span className="font-mono text-xs text-fg-muted tabular">{formatListTime(call.startedAt)}</span>
                <span className="font-mono text-xs text-fg-muted tabular">{call.durationSec ? formatDuration(call.durationSec) : "—"}</span>
                {call.disposition && (
                  <span className="ml-auto">
                    <DispositionBadge code={call.disposition} size="sm" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button asChild variant="secondary" size="sm">
        <Link href={`/app/contacts?id=${conversation.contactId}`}>
          Open contact <ArrowUpRight />
        </Link>
      </Button>
    </div>
  );
}
