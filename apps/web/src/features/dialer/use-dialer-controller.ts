"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { DialerSession, DispositionCode, DispositionInput } from "@dialbrio/types";
import { DISPOSITION_META } from "@/components/domain/status-config";
import { useDropVoicemail, useEndCall, useReserveNextLead, useStartCall, useSubmitDisposition } from "@/lib/queries";
import { useRealtimeEvent } from "@/lib/realtime/hooks";
import { isDraftValid, LIVE_STATES, useDialerStore, WRAP_STATES } from "./store";

const AUTO_DIAL_DELAY_MS = 3000;

function errMessage(e: unknown) {
  return e instanceof Error ? e.message : "Unexpected error";
}

/**
 * Orchestrates the calling loop: reserve lead → call → realtime state → disposition → next lead.
 * Call state is driven by realtime events (SSE in production, mock emitter in the demo).
 */
export function useDialerController(session: DialerSession | undefined) {
  const reserve = useReserveNextLead();
  const start = useStartCall();
  const end = useEndCall();
  const dispo = useSubmitDisposition();
  const vm = useDropVoicemail();
  const set = useDialerStore((s) => s.set);

  // ── Realtime ─────────────────────────────────────────────────────────
  const matches = (callId: string) => {
    const s = useDialerStore.getState();
    if (s.callId) return s.callId === callId;
    if (s.pending) {
      useDialerStore.setState({ callId });
      return true;
    }
    return false;
  };
  useRealtimeEvent("call.state_changed", (e) => {
    if (!matches(e.callId)) return;
    const s = useDialerStore.getState();
    // Wrap-up is terminal until a disposition is saved; ignore late provider events.
    if (s.callState === "failed" || (s.callState === "wrapping_up" && e.state !== "wrapping_up")) return;
    s.applyCallState(e.state, e.state === "failed" ? { reason: e.providerReason ?? "Call failed", retryable: e.retryable ?? true } : undefined);
  });
  useRealtimeEvent("call.transcript", (e) => {
    if (!matches(e.callId)) return;
    const s = useDialerStore.getState();
    if (s.transcript.some((t) => t.id === e.segment.id)) return;
    set({ transcript: [...s.transcript, e.segment] });
  });
  useRealtimeEvent("call.audio_level", (e) => {
    const s = useDialerStore.getState();
    if (s.callId === e.callId && s.callState === "connected") set({ audioLevel: e.level });
  });

  // ── Lead reservation ─────────────────────────────────────────────────
  const reserveOne = useCallback(async () => {
    if (!session) return null;
    try {
      return await reserve.mutateAsync(session.id);
    } catch (e) {
      toast.error("Couldn't reserve the next lead", { description: errMessage(e) });
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    if (!session || useDialerStore.getState().initialized) return;
    set({ initialized: true });
    void (async () => {
      const first = await reserveOne();
      set({ lead: first, queueEmpty: !first });
      if (first) set({ nextLead: await reserveOne() });
    })();
  }, [session, reserveOne, set]);

  const advance = useCallback(async () => {
    const s = useDialerStore.getState();
    const next = s.nextLead ?? (await reserveOne());
    s.resetCall();
    set({ lead: next, nextLead: null, queueEmpty: !next, autoDialAt: next && s.autoDial && !next.complianceBlock ? Date.now() + AUTO_DIAL_DELAY_MS : null });
    if (next) set({ nextLead: await reserveOne() });
  }, [reserveOne, set]);

  // ── Call actions ─────────────────────────────────────────────────────
  const call = useCallback(async () => {
    const s = useDialerStore.getState();
    if (!session || !s.lead || s.lead.complianceBlock || LIVE_STATES.includes(s.callState) || s.pending) return;
    set({
      autoDialAt: null,
      pending: true,
      callId: null,
      callState: "preparing",
      callStartedAt: Date.now(),
      connectedAt: null,
      endedAt: null,
      failure: null,
      transcript: [],
      audioLevel: 0,
    });
    try {
      const { callId } = await start.mutateAsync({ sessionId: session.id, contactId: s.lead.contact.id, callerId: session.callerId });
      set({ callId, pending: false });
    } catch (e) {
      set({ callState: "idle", pending: false, callStartedAt: null });
      toast.error("Call not placed", { description: errMessage(e) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const hangup = useCallback(async () => {
    const s = useDialerStore.getState();
    if (!s.callId || !LIVE_STATES.includes(s.callState)) return;
    s.applyCallState("wrapping_up");
    try {
      await end.mutateAsync(s.callId);
    } catch (e) {
      toast.error("Couldn't end the call cleanly", { description: errMessage(e) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(
    async (override?: DispositionCode) => {
      const s = useDialerStore.getState();
      const draft = override ? { ...s.draft, code: override } : s.draft;
      if (!s.callId || !s.lead || !WRAP_STATES.includes(s.callState) || !isDraftValid(draft) || dispo.isPending) return;
      const code = draft.code!;
      const input: DispositionInput = {
        code,
        notes: s.notes.trim() || undefined,
        callbackAt: code === "callback" ? new Date(draft.callbackAt).toISOString() : undefined,
        appointment: code === "appointment" && draft.slot ? { calendarId: "ghl_calendar_default", startsAt: draft.slot } : undefined,
      };
      try {
        const res = await dispo.mutateAsync({ callId: s.callId, input });
        const name = `${s.lead.contact.firstName} ${s.lead.contact.lastName}`;
        toast.success(`${DISPOSITION_META[code].label} · ${name}`, { description: res.nextAction.label });
        set({ lastOutcome: { name, label: DISPOSITION_META[code].label } });
        await advance();
      } catch (e) {
        toast.error("Disposition not saved", { description: `${errMessage(e)} Nothing was lost — try again.` });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [advance],
  );

  /** One-click voicemail drop: leaves the recording, logs Voicemail and moves to the next lead. */
  const dropVoicemail = useCallback(async () => {
    const s = useDialerStore.getState();
    if (!session?.voicemailDrop || !s.callId || !s.lead || vm.isPending) return;
    if (!["dialing", "ringing", "connected"].includes(s.callState)) return;
    const name = `${s.lead.contact.firstName} ${s.lead.contact.lastName}`;
    try {
      const res = await vm.mutateAsync(s.callId);
      toast.success(`Voicemail dropped · ${name}`, { description: res.nextAction.label });
      set({ lastOutcome: { name, label: "Voicemail drop" } });
      await advance();
    } catch (e) {
      toast.error("Voicemail not dropped", { description: `${errMessage(e)} The call is still live.` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.voicemailDrop, advance]);

  const skip = useCallback(async () => {
    const s = useDialerStore.getState();
    if (LIVE_STATES.includes(s.callState)) return;
    const name = s.lead ? `${s.lead.contact.firstName} ${s.lead.contact.lastName}` : "Lead";
    toast(`${name} skipped`, { description: "Returned to the queue with its reservation released." });
    await advance();
  }, [advance]);

  // ── Auto-dial next ───────────────────────────────────────────────────
  const autoDialAt = useDialerStore((s) => s.autoDialAt);
  useEffect(() => {
    if (!autoDialAt) return;
    const t = setTimeout(() => void call(), Math.max(0, autoDialAt - Date.now()));
    return () => clearTimeout(t);
  }, [autoDialAt, call]);

  return {
    call,
    hangup,
    save,
    skip,
    retry: call,
    dropVoicemail,
    dropping: vm.isPending,
    saving: dispo.isPending,
    ending: end.isPending,
    reserving: reserve.isPending,
  };
}

export type DialerController = ReturnType<typeof useDialerController>;
