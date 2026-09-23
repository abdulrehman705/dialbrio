"use client";

import * as React from "react";
import Link from "next/link";
import { ListOrdered, Phone, PhoneOff } from "lucide-react";
import { DISPOSITION_CODES } from "@dialbrio/types";
import { CALL_STATE_META } from "@/components/domain/status-config";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { useDialerSession, useSetCallerId, useSetSessionLines } from "@/lib/queries";
import { cn, formatClock } from "@/lib/utils";
import { CallPanel, SaveButton, useCallTimer } from "./call-panel";
import { LeadProfile, LeadSwap, LeadWorkTabs } from "./lead-panel";
import { SessionFooter } from "./session-footer";
import { SessionHeader, ShortcutsHint } from "./session-header";
import { LIVE_STATES, useDialerStore, WRAP_STATES } from "./store";
import { useDialerController, type DialerController } from "./use-dialer-controller";

function isTyping(el: EventTarget | null) {
  const t = el as HTMLElement | null;
  if (!t) return false;
  return t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.getAttribute("role") === "combobox";
}

/** Global dialer shortcuts (docs/design.md §20). Paused while typing, except ⌘↵. */
function useDialerShortcuts(ctl: DialerController) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useDialerStore.getState();
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void ctl.save();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      // Don't hijack keys inside open menus/dialogs.
      if ((e.target as HTMLElement | null)?.closest?.("[role=menu],[role=dialog],[role=listbox]")) return;

      if (e.code === "Space") {
        if ((e.target as HTMLElement | null)?.closest?.("button,a,[role=button],[role=tab]")) return; // let focused controls activate
        e.preventDefault();
        if (s.callState === "idle") void ctl.call();
        else if (LIVE_STATES.includes(s.callState)) void ctl.hangup();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "m" && s.callState === "connected") s.set({ muted: !s.muted });
      else if (k === "k" && s.callState === "connected") s.set({ keypadOpen: !s.keypadOpen });
      else if (k === "v" && ["dialing", "ringing", "connected"].includes(s.callState)) void ctl.dropVoicemail();
      else if (/^[1-9]$/.test(e.key) && (s.callState === "connected" || WRAP_STATES.includes(s.callState))) {
        const code = DISPOSITION_CODES[Number(e.key) - 1]!;
        s.setDraft({ code, dncConfirmed: false });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ctl]);
}

/** Tab title + polite screen-reader announcement reflect call state. */
function useCallStateAnnouncements() {
  const state = useDialerStore((s) => s.callState);
  const lead = useDialerStore((s) => s.lead);
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    const prev = document.title;
    return () => void (document.title = prev);
  }, []);
  React.useEffect(() => {
    const name = lead ? `${lead.contact.firstName} ${lead.contact.lastName}` : "";
    const label = CALL_STATE_META[state].label;
    document.title = state === "idle" ? `Dialer${name ? ` · ${name}` : ""} · DialBrio` : `${label} · ${name} · DialBrio`;
    setMessage(state === "idle" ? (name ? `Next lead: ${name}` : "") : `Call ${label.toLowerCase()}${name ? ` with ${name}` : ""}`);
  }, [state, lead]);
  return message;
}

function MobileCallBar({ ctl }: { ctl: DialerController }) {
  const state = useDialerStore((s) => s.callState);
  const lead = useDialerStore((s) => s.lead);
  const secs = useCallTimer();
  if (!lead) return null;
  const live = LIVE_STATES.includes(state);
  const wrap = WRAP_STATES.includes(state);
  const meta = CALL_STATE_META[state];
  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-fg">{meta.label}</p>
        <p className="font-mono text-xs text-fg-muted tabular">{state === "idle" ? `${lead.contact.firstName} ${lead.contact.lastName}` : formatClock(secs)}</p>
      </div>
      {state === "idle" ? (
        <Button variant="success" size="lg" disabled={!!lead.complianceBlock} onClick={() => void ctl.call()}>
          <Phone /> Call
        </Button>
      ) : live ? (
        <Button variant="danger" size="lg" onClick={() => void ctl.hangup()} loading={ctl.ending}>
          <PhoneOff /> End
        </Button>
      ) : wrap ? (
        <div className="w-44">
          <SaveButton ctl={ctl} compact />
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col lg:h-full" aria-busy aria-label="Loading dialer">
      <div className="flex gap-4 border-b border-border bg-surface p-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-52" />
        <Skeleton className="ml-auto h-9 w-40" />
      </div>
      <div className="grid flex-1 gap-px bg-border lg:grid-cols-[1fr_360px] xl:grid-cols-[340px_1fr_380px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("space-y-4 bg-background p-5", i === 1 && "max-xl:hidden")}>
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24" />
            <Skeleton className="h-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DialerWorkspace() {
  const session = useDialerSession();
  const setCallerId = useSetCallerId();
  const setLines = useSetSessionLines();
  const ctl = useDialerController(session.data);
  const lead = useDialerStore((s) => s.lead);
  const queueEmpty = useDialerStore((s) => s.queueEmpty);
  const callState = useDialerStore((s) => s.callState);
  const announcement = useCallStateAnnouncements();
  useDialerShortcuts(ctl);

  if (session.isError)
    return <ErrorState title="Dialer session unavailable" description="We couldn't start your calling session. No calls were placed." onRetry={() => session.refetch()} className="mt-10" />;
  if (!session.data) return <WorkspaceSkeleton />;

  return (
    <div className="flex flex-col lg:h-full">
      <h1 className="sr-only">Dialer</h1>
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>
      <SessionHeader
        session={session.data}
        locked={callState !== "idle"}
        onCallerIdChange={(number) => setCallerId.mutate({ sessionId: session.data!.id, number })}
        onLinesChange={(lines) => setLines.mutate({ sessionId: session.data!.id, lines })}
      />

      {queueEmpty && !lead ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={ListOrdered}
            title="No eligible leads right now"
            description="Every lead in this queue is either reserved, outside its calling window, or waiting on a retry timer."
            action={
              <Button asChild variant="secondary" size="sm">
                <Link href="/app/queue">Open queue</Link>
              </Button>
            }
          />
        </div>
      ) : !lead ? (
        <div className="grid flex-1 gap-px bg-border lg:grid-cols-[1fr_360px] xl:grid-cols-[340px_1fr_380px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("space-y-4 bg-background p-5", i === 1 && "max-xl:hidden")}>
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24" />
              <Skeleton className="h-40" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[340px_minmax(0,1fr)_380px]">
          {/* Lead profile: own column on xl, stacked above tabs below xl */}
          <aside aria-label="Lead details" className="min-h-0 border-border bg-surface lg:overflow-y-auto xl:border-r max-xl:hidden">
            <LeadSwap id={lead.contact.id}>
              <LeadProfile lead={lead} />
            </LeadSwap>
          </aside>

          <section aria-label="Script, notes and history" className="flex min-h-0 flex-col border-border bg-background max-lg:order-2 max-lg:border-t lg:overflow-y-auto xl:overflow-hidden">
            <div className="xl:hidden">
              <LeadSwap id={lead.contact.id}>
                <LeadProfile lead={lead} />
              </LeadSwap>
            </div>
            <div className="flex min-h-[420px] flex-1 flex-col max-xl:border-t max-xl:border-border xl:min-h-0">
              <LeadWorkTabs lead={lead} campaignId={session.data.campaign.id} />
            </div>
          </section>

          <aside aria-label="Call controls" className="flex min-h-0 flex-col border-border bg-surface max-lg:order-1 lg:border-l">
            <CallPanel lead={lead} session={session.data} ctl={ctl} />
          </aside>
        </div>
      )}

      <SessionFooter session={session.data} className="max-lg:order-3" />
      <div className="flex justify-center border-t border-border bg-surface py-2 lg:hidden">
        <ShortcutsHint />
      </div>
      <MobileCallBar ctl={ctl} />
    </div>
  );
}
