"use client";

import * as React from "react";
import { Inbox, Search, X } from "lucide-react";
import type { Conversation, ConversationFilter } from "@dialbrio/types";
import { useConversations } from "@/lib/queries";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { LEAD_STATE_META } from "@/components/domain/status-config";
import { EmptyState, ErrorState } from "@/components/states";
import { cn, formatListTime, initials } from "@/lib/utils";
import { CHANNELS } from "./channels";

const LEAD_DOT = { fresh: "bg-lead-fresh", warm: "bg-lead-warm", aged: "bg-lead-aged", zombie: "bg-lead-zombie" } as const;

const FILTERS: { value: ConversationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "mine", label: "Mine" },
  { value: "unassigned", label: "Unassigned" },
  { value: "team", label: "Team" },
];

function Item({ c, active, onSelect }: { c: Conversation; active: boolean; onSelect: () => void }) {
  const Icon = CHANNELS[c.lastChannel].icon;
  const unread = c.unreadCount > 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors duration-(--duration-fast)",
        active ? "bg-surface-sunken" : "hover:bg-surface-hover",
      )}
    >
      <Avatar name={c.contactName} initials={initials(c.contactName)} size="md" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-[13px]", unread ? "font-semibold text-fg" : "font-medium text-fg")}>{c.contactName}</span>
          <span className={cn("shrink-0 font-mono text-[11px]", unread ? "text-brand-text" : "text-fg-muted")}>{formatListTime(c.lastMessageAt)}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5">
          <Icon className="size-3.5 shrink-0 text-fg-muted" aria-label={CHANNELS[c.lastChannel].label} />
          <span className={cn("truncate text-[13px]", unread ? "text-fg-secondary" : "text-fg-muted")}>{c.lastMessagePreview}</span>
          {unread && (
            <span className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-solid px-1.5 text-[11px] font-semibold text-white tabular" aria-label={`${c.unreadCount} unread`}>
              {c.unreadCount}
            </span>
          )}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-fg-muted">
          <span className={cn("size-1.5 shrink-0 rounded-full", LEAD_DOT[c.leadState])} aria-hidden />
          <span>{LEAD_STATE_META[c.leadState].label}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{c.assigneeName ?? "Unassigned"}</span>
        </span>
      </span>
    </button>
  );
}

interface ListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function ConversationList({ selectedId, onSelect, className }: ListProps) {
  const [filter, setFilter] = React.useState<ConversationFilter>("all");
  const [query, setQuery] = React.useState("");
  const [q, setQ] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setQ(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);
  const { data, isLoading, isError, refetch } = useConversations(filter, q || undefined);

  return (
    <section aria-label="Conversation list" className={cn("flex min-h-0 flex-col bg-surface", className)}>
      <div className="flex flex-col gap-2.5 border-b border-border p-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
          leadingIcon={<Search />}
          trailing={
            query ? (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="rounded-sm p-1 text-fg-muted hover:text-fg">
                <X className="size-3.5" />
              </button>
            ) : undefined
          }
        />
        <div className="overflow-x-auto">
          <Segmented label="Filter conversations" value={filter} onValueChange={setFilter} options={FILTERS} className="max-lg:h-11 [&>button]:max-lg:h-10" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex gap-3 border-b border-border px-4 py-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState compact onRetry={() => refetch()} description="Conversations could not be loaded." />
        ) : !data?.length ? (
          <EmptyState
            compact
            icon={Inbox}
            title={q ? `No results for “${q}”` : filter === "unread" ? "No unread conversations" : "No conversations here"}
            description={q ? "Try a name, phone number or message text." : "Replies from leads land here in real time."}
          />
        ) : (
          <ul>
            {data.map((c) => (
              <li key={c.id}>
                <Item c={c} active={c.id === selectedId} onSelect={() => onSelect(c.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
