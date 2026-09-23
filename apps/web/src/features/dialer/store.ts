"use client";

import { create } from "zustand";
import type { CallState, DialerLead, DispositionCode, TranscriptSegment } from "@dialbrio/types";

/**
 * Dialer UI state for the active agent session. Feature-scoped (not global shell state).
 * Server state (session, leads, playbook) is fetched via lib/queries; this store only tracks the
 * live call as reported by realtime events plus the agent's in-progress wrap-up input.
 */
export interface CallFailure {
  reason: string;
  retryable: boolean;
}

export interface DispositionDraft {
  code: DispositionCode | null;
  callbackAt: string;
  slot: string | null;
  dncConfirmed: boolean;
}

interface DialerState {
  initialized: boolean;
  lead: DialerLead | null;
  nextLead: DialerLead | null;
  queueEmpty: boolean;

  callState: CallState;
  callId: string | null;
  /** True between requesting a call and receiving its id (events may arrive first). */
  pending: boolean;
  callStartedAt: number | null;
  connectedAt: number | null;
  endedAt: number | null;
  failure: CallFailure | null;
  transcript: TranscriptSegment[];
  audioLevel: number;
  muted: boolean;
  keypadOpen: boolean;
  dtmf: string;

  draft: DispositionDraft;
  notes: string;
  autoDial: boolean;
  autoDialAt: number | null;
  lastOutcome: { name: string; label: string } | null;

  set: (patch: Partial<DialerState>) => void;
  setDraft: (patch: Partial<DispositionDraft>) => void;
  applyCallState: (state: CallState, failure?: CallFailure) => void;
  /** Reset call + wrap-up state for a new lead. */
  resetCall: () => void;
}

const emptyDraft: DispositionDraft = { code: null, callbackAt: "", slot: null, dncConfirmed: false };

const callReset = {
  callState: "idle" as CallState,
  callId: null,
  pending: false,
  callStartedAt: null,
  connectedAt: null,
  endedAt: null,
  failure: null,
  transcript: [],
  audioLevel: 0,
  muted: false,
  keypadOpen: false,
  dtmf: "",
  draft: emptyDraft,
  notes: "",
};

export const useDialerStore = create<DialerState>()((set, get) => ({
  initialized: false,
  lead: null,
  nextLead: null,
  queueEmpty: false,
  ...callReset,
  autoDial: false,
  autoDialAt: null,
  lastOutcome: null,

  set: (patch) => set(patch),
  setDraft: (patch) => set({ draft: { ...get().draft, ...patch } }),
  applyCallState: (state, failure) => {
    const now = Date.now();
    const s = get();
    set({
      callState: state,
      callStartedAt: s.callStartedAt ?? now,
      connectedAt: state === "connected" ? (s.connectedAt ?? now) : s.connectedAt,
      endedAt: state === "wrapping_up" || state === "failed" || state === "completed" ? (s.endedAt ?? now) : s.endedAt,
      failure: state === "failed" ? (failure ?? { reason: "The call could not be completed.", retryable: true }) : null,
      muted: state === "connected" ? s.muted : false,
      keypadOpen: state === "connected" ? s.keypadOpen : false,
    });
  },
  resetCall: () => set({ ...callReset }),
}));

/** States in which a call is live and can be ended. */
export const LIVE_STATES: CallState[] = ["preparing", "dialing", "ringing", "connected"];
/** States in which a disposition can be saved. */
export const WRAP_STATES: CallState[] = ["wrapping_up", "failed"];

export function isDraftValid(d: DispositionDraft) {
  if (!d.code) return false;
  if (d.code === "callback") return !!d.callbackAt;
  if (d.code === "appointment") return !!d.slot;
  if (d.code === "dnc") return d.dncConfirmed;
  return true;
}
