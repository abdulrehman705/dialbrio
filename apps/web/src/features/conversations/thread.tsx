"use client";

import * as React from "react";
import { ArrowLeft, MessagesSquare, PanelRight, PhoneCall } from "lucide-react";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import type { Conversation, ConversationEntry } from "@dialbrio/types";
import { useConversationEntries } from "@/lib/queries";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mono } from "@/components/ui/mono";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { LeadStateBadge } from "@/components/domain";
import { EmptyState, ErrorState } from "@/components/states";
import { formatPhone, initials } from "@/lib/utils";
import { renderEntry } from "./channels";
import { Composer } from "./composer";

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

function groupByDay(entries: ConversationEntry[]) {
  const groups: { label: string; entries: ConversationEntry[] }[] = [];
  for (const e of entries) {
    const label = dayLabel(e.at);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.entries.push(e);
    else groups.push({ label, entries: [e] });
  }
  return groups;
}

interface ThreadProps {
  conversation: Conversation;
  onBack: () => void;
  onOpenContext: () => void;
}

export function Thread({ conversation, onBack, onOpenContext }: ThreadProps) {
  const { data, isLoading, isError, refetch } = useConversationEntries(conversation.id);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [data?.length, conversation.id]);

  return (
    <section aria-label={`Conversation with ${conversation.contactName}`} className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5 md:px-4">
        <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Back to conversations" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <Avatar name={conversation.contactName} initials={initials(conversation.contactName)} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[16px] font-bold tracking-[-0.02em] text-fg">{conversation.contactName}</p>
          <p className="flex items-center gap-2 text-xs text-fg-muted">
            <Mono>{formatPhone(conversation.contactPhone)}</Mono>
            <span className="max-sm:hidden">
              <LeadStateBadge state={conversation.leadState} size="sm" explain={false} />
            </span>
          </p>
        </div>
        <Tooltip content="Call from the Dialer">
          <Button asChild variant="secondary" size="icon-sm" aria-label={`Call ${conversation.contactName}`}>
            <Link href="/app/dialer">
              <PhoneCall />
            </Link>
          </Button>
        </Tooltip>
        <Tooltip content="Contact details">
          <Button variant="secondary" size="icon-sm" className="xl:hidden" aria-label="Show contact details" onClick={onOpenContext}>
            <PanelRight />
          </Button>
        </Tooltip>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-6" role="log" aria-live="polite" aria-label="Messages">
        {isLoading ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="ml-auto h-14 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} description="Messages could not be loaded." />
        ) : !data?.length ? (
          <EmptyState icon={MessagesSquare} title="No messages yet" description={`Send the first text to ${conversation.contactName.split(" ")[0]}.`} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {groupByDay(data).map((g) => (
              <div key={g.label} className="flex flex-col gap-3">
                <div className="flex items-center gap-3" role="separator" aria-label={g.label}>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-medium text-fg-muted">{g.label}</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                {g.entries.map((e) => (
                  <React.Fragment key={e.id}>{renderEntry(e)}</React.Fragment>
                ))}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <Composer conversation={conversation} />
    </section>
  );
}
