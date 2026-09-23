"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { MessagesSquare } from "lucide-react";
import { qk, useConversations, useMarkConversationRead, useSubAccount } from "@/lib/queries";
import { useRealtimeEvent } from "@/lib/realtime/hooks";
import { Sheet, SheetContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";
import { Thread } from "./thread";
import { ContactContext } from "./contact-context";

export function ConversationsView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedId = params.get("id");
  const sub = useSubAccount();
  const qc = useQueryClient();
  const [contextOpen, setContextOpen] = React.useState(false);

  // The selected conversation is resolved from the unfiltered list so filters never "lose" the open thread.
  const all = useConversations("all");
  const selected = all.data?.find((c) => c.id === selectedId) ?? null;

  const markRead = useMarkConversationRead();
  const markReadRef = React.useRef(markRead.mutate);
  markReadRef.current = markRead.mutate;
  React.useEffect(() => {
    if (selected && selected.unreadCount > 0) markReadRef.current(selected.id);
  }, [selected]);

  useRealtimeEvent("message.received", (e) => {
    void qc.invalidateQueries({ queryKey: ["conversations", sub] });
    void qc.invalidateQueries({ queryKey: qk.conversationEntries(sub, e.conversationId) });
  });

  const select = (id: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("id", id);
    else next.delete("id");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex h-full min-h-0">
      <h1 className="sr-only">Conversations</h1>
      <ConversationList
        selectedId={selectedId}
        onSelect={select}
        className={cn("w-full border-r border-border md:w-80 lg:w-[340px] md:shrink-0", selectedId && "max-md:hidden")}
      />

      <div className={cn("min-w-0 flex-1", !selectedId && "max-md:hidden", "flex")}>
        {selected ? (
          <Thread conversation={selected} onBack={() => select(null)} onOpenContext={() => setContextOpen(true)} />
        ) : selectedId && all.isLoading ? (
          <div className="flex-1 space-y-4 p-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-background">
            <EmptyState
              icon={MessagesSquare}
              title={selectedId ? "Conversation not found" : "Select a conversation"}
              description={selectedId ? "It may have been reassigned or removed." : "SMS replies and call history for each lead appear together in one thread."}
            />
          </div>
        )}
      </div>

      {selected && (
        <aside aria-label="Contact details" className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-surface xl:block">
          <ContactContext conversation={selected} />
        </aside>
      )}

      <Sheet open={contextOpen && !!selected} onOpenChange={setContextOpen}>
        <SheetContent side="right" title="Contact details" className="max-w-sm">
          <div className="min-h-0 flex-1 overflow-y-auto">{selected && <ContactContext conversation={selected} />}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
