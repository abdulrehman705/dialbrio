import type { AgentStatus, CallState, TranscriptSegment } from "@dialbrio/types";

/**
 * Realtime events pushed to the browser. Production: SSE on /v1/stream (docs/architecture.md §10).
 * Demo: an in-memory emitter driven by the mock telephony simulation.
 */
export type RealtimeEvent =
  | { type: "call.state_changed"; callId: string; state: CallState; providerReason?: string; retryable?: boolean }
  | { type: "call.transcript"; callId: string; segment: TranscriptSegment }
  | { type: "call.audio_level"; callId: string; level: number }
  | { type: "agent.status_changed"; userId: string; status: AgentStatus }
  | { type: "queue.counts"; queueId: string; waiting: number }
  | { type: "message.received"; conversationId: string }
  | { type: "sync.status"; state: "synced" | "syncing" | "error"; at: string };

export type ConnectionState = "online" | "reconnecting" | "offline";
type Handler = (e: RealtimeEvent) => void;

export interface RealtimeClient {
  subscribe(handler: Handler): () => void;
  onConnection(handler: (s: ConnectionState) => void): () => void;
}

class Emitter implements RealtimeClient {
  private handlers = new Set<Handler>();
  private connHandlers = new Set<(s: ConnectionState) => void>();
  subscribe(h: Handler) {
    this.handlers.add(h);
    return () => void this.handlers.delete(h);
  }
  onConnection(h: (s: ConnectionState) => void) {
    this.connHandlers.add(h);
    h("online");
    return () => void this.connHandlers.delete(h);
  }
  emit(e: RealtimeEvent) {
    this.handlers.forEach((h) => h(e));
  }
}

/** Demo emitter. Exported for the mock repository only. */
export const mockRealtime = new Emitter();

class SseClient implements RealtimeClient {
  private source: EventSource | null = null;
  private handlers = new Set<Handler>();
  private connHandlers = new Set<(s: ConnectionState) => void>();
  private state: ConnectionState = "reconnecting";

  private ensure() {
    if (this.source || typeof window === "undefined") return;
    this.source = new EventSource(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/v1/stream`, { withCredentials: true });
    this.source.onopen = () => this.setState("online");
    this.source.onerror = () => this.setState(navigator.onLine ? "reconnecting" : "offline");
    this.source.onmessage = (m) => {
      try {
        const e = JSON.parse(m.data) as RealtimeEvent;
        this.handlers.forEach((h) => h(e));
      } catch {
        /* ignore malformed frames */
      }
    };
  }
  private setState(s: ConnectionState) {
    this.state = s;
    this.connHandlers.forEach((h) => h(s));
  }
  subscribe(h: Handler) {
    this.ensure();
    this.handlers.add(h);
    return () => void this.handlers.delete(h);
  }
  onConnection(h: (s: ConnectionState) => void) {
    this.ensure();
    this.connHandlers.add(h);
    h(this.state);
    return () => void this.connHandlers.delete(h);
  }
}

export const realtime: RealtimeClient = (process.env.NEXT_PUBLIC_API_MODE ?? "mock") === "http" ? new SseClient() : mockRealtime;
