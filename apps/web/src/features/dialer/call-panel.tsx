"use client";

import * as React from "react";
import { addDays, format, isWeekend, setHours, setMinutes } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CircleCheck, Info, Mic, MicOff, Phone, PhoneMissed, RotateCcw, SkipForward, Voicemail, X } from "lucide-react";
import type { CallState, DialerLead, DialerSession } from "@dialbrio/types";
import { CallControls } from "@/components/domain/call-controls";
import { DispositionPicker, type DispositionSlot } from "@/components/domain/disposition-picker";
import { TranscriptViewer } from "@/components/domain/transcript-viewer";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { StatusDot } from "@/components/ui/status-dot";
import { Tooltip } from "@/components/ui/tooltip";
import { useMe } from "@/lib/queries";
import { cn, formatClock, formatPhone, initials } from "@/lib/utils";
import { isDraftValid, LIVE_STATES, useDialerStore, WRAP_STATES } from "./store";
import { useNow } from "./use-now";
import type { DialerController } from "./use-dialer-controller";

/** Upcoming business-hour slots. Placeholder until CRM availability (CRMAdapter.getAvailability) is wired in Phase 4. */
function suggestedSlots(): DispositionSlot[] {
  const out: DispositionSlot[] = [];
  let d = addDays(new Date(), 1);
  while (out.length < 4) {
    if (!isWeekend(d)) {
      for (const h of [10, 14]) {
        const t = setMinutes(setHours(d, h), 0);
        out.push({ value: t.toISOString(), label: format(t, "EEE MMM d · h:mm a") });
      }
    }
    d = addDays(d, 1);
  }
  return out;
}

const STATE_COPY: Record<CallState, string> = {
  idle: "Ready",
  preparing: "Checking compliance",
  dialing: "Dialing",
  ringing: "Ringing",
  connected: "Connected",
  wrapping_up: "Wrap-up",
  completed: "Completed",
  failed: "Didn't connect",
};

const STATE_TEXT: Record<CallState, string> = {
  idle: "text-fg-muted",
  preparing: "text-fg-secondary",
  dialing: "text-call-ringing",
  ringing: "text-call-ringing",
  connected: "text-call-connected",
  wrapping_up: "text-warning-text",
  completed: "text-fg-secondary",
  failed: "text-danger-text",
};

export function useCallTimer() {
  const { callState, callStartedAt, connectedAt, endedAt } = useDialerStore();
  const live = LIVE_STATES.includes(callState);
  const now = useNow(live);
  const from = connectedAt ?? callStartedAt;
  if (!from) return 0;
  return ((live ? now : (endedAt ?? now)) - from) / 1000;
}

function AudioMeter({ level, muted }: { level: number; muted: boolean }) {
  const bars = [0.2, 0.4, 0.6, 0.8, 1];
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
      {bars.map((b) => (
        <span key={b} className={cn("w-[3px] rounded-full transition-colors duration-100", !muted && level >= b - 0.2 ? "bg-call-connected" : "bg-border-strong")} style={{ height: `${b * 100}%` }} />
      ))}
    </span>
  );
}

function CallReadout({ lead, session }: { lead: DialerLead; session: DialerSession }) {
  const state = useDialerStore((s) => s.callState);
  const muted = useDialerStore((s) => s.muted);
  const level = useDialerStore((s) => s.audioLevel);
  const secs = useCallTimer();
  const name = `${lead.contact.firstName} ${lead.contact.lastName}`;
  const ringing = state === "dialing" || state === "ringing";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex size-11 shrink-0 items-center justify-center">
          {ringing && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-call-ringing animate-ring-pulse" aria-hidden />
              <span className="absolute inset-0 rounded-full border-2 border-call-ringing animate-ring-pulse [animation-delay:0.8s]" aria-hidden />
            </>
          )}
          {state === "connected" && <span className="absolute -inset-0.5 rounded-full border-2 border-call-connected" aria-hidden />}
          <Avatar name={name} initials={initials(name)} size="lg" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-fg">{name}</p>
          <p className="truncate font-mono text-xs text-fg-muted">
            {formatPhone(lead.contact.phone)} <span className="font-sans">from</span> {formatPhone(session.callerId)}
          </p>
        </div>
      </div>

      <div>
        <p className={cn("flex items-center gap-1.5 text-[13px] font-semibold", STATE_TEXT[state])}>
          {state === "connected" ? <StatusDot tone="connected" live size="md" /> : ringing ? <StatusDot tone="ringing" live size="md" /> : null}
          {STATE_COPY[state]}
        </p>
        <p
          className={cn("font-display text-[52px] leading-[1.05] font-bold tracking-[-0.04em]", state === "idle" ? "text-fg-muted/60" : "text-fg")}
          aria-label="Call timer"
        >
          {state === "idle" ? "0:00" : formatClock(secs)}
        </p>
        {state === "connected" && (
          <p className="mt-1 flex items-center gap-2 text-xs text-fg-secondary">
            {muted ? <MicOff className="size-3.5 text-warning-text" aria-hidden /> : <Mic className="size-3.5 text-call-connected" aria-hidden />}
            {muted ? "You're muted" : "Audio connected"}
            <AudioMeter level={level} muted={muted} />
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Parallel-line status while dialing. In production each line's state comes from its own call
 * events; the demo only simulates the extra lines, and says so.
 */
function LinesStrip({ lines }: { lines: number }) {
  const state = useDialerStore((s) => s.callState);
  const startedAt = useDialerStore((s) => s.callStartedAt);
  const now = useNow(state === "dialing" || state === "ringing", 500);
  if (lines < 2 || !["dialing", "ringing", "connected"].includes(state)) return null;
  const t = startedAt ? (now - startedAt) / 1000 : 0;
  const connected = state === "connected";
  if (connected)
    return (
      <p className="-mt-2 text-xs text-fg-muted">
        Line 1 answered and bridged to you. {lines === 2 ? "Line 2 was" : `Lines 2–${lines} were`} released.{" "}
        <Tooltip content="Extra lines are simulated in this demo. With Twilio connected, each line is a real call and AMD decides who reaches you.">
          <span tabIndex={0} className="cursor-help underline decoration-dotted underline-offset-2">
            Simulated in demo
          </span>
        </Tooltip>
      </p>
    );

  const others = [
    t > 2.2 ? ["Voicemail detected, hung up", "text-fg-muted"] : ["Ringing", "text-call-ringing"],
    t > 3.2 ? ["No answer", "text-fg-muted"] : ["Ringing", "text-call-ringing"],
    ["Ringing", "text-call-ringing"],
  ] as const;

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs font-semibold text-fg-secondary">{lines} lines</p>
        <Tooltip content="Extra lines are simulated in this demo. With Twilio connected, each line is a real call and AMD decides who reaches you.">
          <span tabIndex={0} className="flex cursor-help items-center gap-1 rounded-sm text-[11px] text-fg-muted">
            <Info className="size-3" aria-hidden /> Simulated in demo
          </span>
        </Tooltip>
      </div>
      <ol className="divide-y divide-border text-[13px]">
        <li className="flex items-center justify-between gap-2 px-3 py-1.5">
          <span className="font-mono text-xs text-fg-muted">Line 1</span>
          <span className={connected ? "font-medium text-call-connected" : "text-call-ringing"}>{connected ? "Answered, bridged to you" : "Ringing"}</span>
        </li>
        {others.slice(0, lines - 1).map(([label, tone], i) => (
          <li key={i} className="flex items-center justify-between gap-2 px-3 py-1.5">
            <span className="font-mono text-xs text-fg-muted">Line {i + 2}</span>
            <span className={connected ? "text-fg-muted" : tone}>{connected ? "Released" : label}</span>
          </li>
        ))}
      </ol>
      {!connected && <p className="border-t border-border px-3 py-2 text-xs text-fg-muted">The first person to answer is connected to you. The rest are released.</p>}
    </div>
  );
}

interface CallPanelProps {
  lead: DialerLead;
  session: DialerSession;
  ctl: DialerController;
}

export function CallPanel({ lead, session, ctl }: CallPanelProps) {
  const s = useDialerStore();
  const { data: me } = useMe();
  const slots = React.useMemo(suggestedSlots, []);
  const live = LIVE_STATES.includes(s.callState);
  const wrap = WRAP_STATES.includes(s.callState);
  const pickerEnabled = s.callState === "connected" || wrap;
  const block = lead.complianceBlock;
  const first = lead.contact.firstName;
  const now = useNow(!!s.autoDialAt, 250);
  const autoIn = s.autoDialAt ? Math.max(0, Math.ceil((s.autoDialAt - now) / 1000)) : 0;
  const vm = session.voicemailDrop;
  const canDropVm = !!vm && !!s.callId && (s.callState === "dialing" || s.callState === "ringing" || s.callState === "connected");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {s.callState === "connected" && <div className="h-0.5 shrink-0 bg-call-connected" aria-hidden />}
      {(s.callState === "dialing" || s.callState === "ringing") && <div className="h-0.5 shrink-0 bg-call-ringing" aria-hidden />}
      {s.callState === "failed" && <div className="h-0.5 shrink-0 bg-call-failed" aria-hidden />}

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-5">
        <CallReadout lead={lead} session={session} />

        {/* Compliance block: deterministic, shown before dialing */}
        {block && s.callState === "idle" && (
          <div role="alert" className="rounded-lg bg-warning-soft px-3.5 py-3">
            <p className="text-[13px] font-semibold text-warning-text">
              {block.code === "calling_window" ? "Outside the calling window" : block.code === "dnc" ? "On the Do Not Call list" : "No calling consent"}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-fg-secondary">{block.message}</p>
            <p className="mt-1.5 text-xs text-fg-muted">Compliance blocks can&apos;t be overridden from the dialer. Skip to keep moving.</p>
          </div>
        )}

        {/* Failure */}
        {s.callState === "failed" && s.failure && (
          <div role="alert" className="flex flex-col gap-3 rounded-lg bg-danger-soft px-3.5 py-3">
            <div>
              <p className="text-[13px] font-semibold text-danger-text">Call didn&apos;t connect</p>
              <p className="mt-0.5 text-[13px] leading-5 text-fg-secondary">{s.failure.reason}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.failure.retryable && (
                <Button size="sm" variant="secondary" onClick={() => void ctl.retry()}>
                  <RotateCcw /> Retry now
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => void ctl.save("no_answer")} loading={ctl.saving}>
                <PhoneMissed /> Log no answer, next lead
              </Button>
            </div>
          </div>
        )}

        {/* Primary / controls */}
        {s.callState === "idle" ? (
          <div className="flex flex-col gap-2">
            {s.autoDialAt ? (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-sunken px-3 py-2.5 text-[13px]" role="status">
                <span className="text-fg-secondary">
                  Calling {first} in <span className="font-mono text-fg tabular">{autoIn}s</span>
                </span>
                <Button size="xs" variant="ghost" onClick={() => s.set({ autoDialAt: null })}>
                  <X /> Cancel
                </Button>
              </div>
            ) : null}
            <Button variant="success" size="lg" className="w-full" disabled={!!block} onClick={() => void ctl.call()} aria-keyshortcuts="Space">
              <Phone /> {session.lines > 1 ? `Call ${first} + ${session.lines - 1} more` : `Call ${first}`}
              <Kbd className="ml-1 border-white/25 bg-white/10 text-white/80 max-lg:hidden">Space</Kbd>
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => void ctl.skip()} loading={ctl.reserving && !s.nextLead}>
              <SkipForward /> Skip lead
            </Button>
          </div>
        ) : live ? (
          <div className="flex flex-col gap-3">
            <CallControls
              state={s.callState}
              muted={s.muted}
              onToggleMute={() => s.set({ muted: !s.muted })}
              keypadOpen={s.keypadOpen}
              onKeypadOpenChange={(o) => s.set({ keypadOpen: o })}
              dtmf={s.dtmf}
              onDigit={(d) => s.set({ dtmf: (s.dtmf + d).slice(-24) })}
              onClearDigits={() => s.set({ dtmf: "" })}
              onEnd={() => void ctl.hangup()}
              ending={ctl.ending}
            />
            {vm && (
              <Button variant="secondary" className="h-auto w-full justify-between py-2" disabled={!canDropVm} loading={ctl.dropping} onClick={() => void ctl.dropVoicemail()} aria-keyshortcuts="V">
                <span className="flex items-center gap-2">
                  <Voicemail />
                  <span className="flex flex-col items-start leading-tight">
                    <span>Drop voicemail</span>
                    <span className="text-xs font-normal text-fg-muted">
                      {vm.name} · <span className="font-mono">{formatClock(vm.durationSec)}</span>
                    </span>
                  </span>
                </span>
                <Kbd className="max-lg:hidden">V</Kbd>
              </Button>
            )}
          </div>
        ) : null}

        <LinesStrip lines={session.lines} />

        {/* Live transcript */}
        {(s.callState === "connected" || (s.callState === "wrapping_up" && s.transcript.length > 0)) && (
          <section aria-label="Live transcript" className="rounded-lg bg-surface-sunken">
            <div className="flex items-center justify-between px-3 pt-2.5">
              <p className="text-xs font-semibold text-fg-secondary">Transcript</p>
              {s.callState === "connected" && (
                <span className="flex items-center gap-1.5 text-[11px] text-fg-muted">
                  <StatusDot tone="connected" live /> Live
                </span>
              )}
            </div>
            <div className="max-h-56 overflow-y-auto p-3">
              {s.transcript.length ? (
                <TranscriptViewer segments={s.transcript} live agentName={me?.user.name.split(" ")[0] ?? "You"} contactName={first} />
              ) : (
                <p className="text-xs text-fg-muted">Listening. Lines appear as each speaker finishes.</p>
              )}
            </div>
          </section>
        )}

        {/* Outcome */}
        <section aria-labelledby="dispo-title" className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="dispo-title" className="font-display text-[15px] font-bold tracking-[-0.01em] text-fg">
              Outcome
            </h2>
            <span className="text-xs text-fg-muted">{pickerEnabled ? <span className="max-lg:hidden">Keys 1–9</span> : "Unlocks when the call connects"}</span>
          </div>
          <DispositionPicker
            code={s.draft.code}
            onCodeChange={(code) => s.setDraft({ code, dncConfirmed: false })}
            callbackAt={s.draft.callbackAt}
            onCallbackAtChange={(callbackAt) => s.setDraft({ callbackAt })}
            slot={s.draft.slot}
            onSlotChange={(slot) => s.setDraft({ slot })}
            slots={slots}
            slotsNote="Suggested consult times. Live GoHighLevel calendar availability connects in Phase 4."
            dncConfirmed={s.draft.dncConfirmed}
            onDncConfirmedChange={(dncConfirmed) => s.setDraft({ dncConfirmed })}
            phoneLabel={formatPhone(lead.contact.phone)}
            disabled={!pickerEnabled}
          />
        </section>
      </div>

      {/* Save & next, pinned to the panel bottom */}
      <AnimatePresence initial={false}>
        {(wrap || s.callState === "connected") && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="shrink-0 border-t border-border bg-surface p-4 max-lg:hidden"
          >
            <SaveButton ctl={ctl} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SaveButton({ ctl, compact }: { ctl: DialerController; compact?: boolean }) {
  const state = useDialerStore((s) => s.callState);
  const draft = useDialerStore((s) => s.draft);
  const wrap = WRAP_STATES.includes(state);
  const valid = isDraftValid(draft);
  const hint = !wrap ? "End the call to save" : !draft.code ? "Choose an outcome" : !valid ? (draft.code === "callback" ? "Pick a callback time" : draft.code === "appointment" ? "Pick a time slot" : "Confirm DNC") : null;
  return (
    <div className="flex flex-col gap-1.5">
      <Button variant="primary" size="lg" className="w-full" disabled={!wrap || !valid} loading={ctl.saving} onClick={() => void ctl.save()} aria-keyshortcuts="Meta+Enter Control+Enter">
        {valid && wrap ? <CircleCheck /> : null}
        Save &amp; next lead
        {!compact && <Kbd className="ml-1 border-white/25 bg-white/10 text-white/80 max-lg:hidden">⌘↵</Kbd>}
        {compact && <ArrowRight />}
      </Button>
      {hint && !compact && <p className="text-center text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
