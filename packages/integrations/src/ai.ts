import type { AIIntentResult, ID, TranscriptSegment } from "@dialbrio/types";

/**
 * AI boundaries. Providers are swappable; results are structured and validated (Zod) before use.
 * Free-form model text never mutates system state directly — deterministic services apply outcomes.
 */
export interface TranscriptionProvider {
  readonly name: string;
  transcribe(input: { audioUrl: string; language?: string }): Promise<{ segments: TranscriptSegment[]; confidence: number }>;
  /** Real-time streaming (Phase 6). */
  stream?(input: { sampleRate: number; onSegment: (s: TranscriptSegment) => void }): { write(chunk: Uint8Array): void; close(): Promise<void> };
}

export interface LLMProvider {
  readonly name: string;
  /** Returns JSON that the caller validates against `schemaName`'s Zod schema. */
  structured<T>(input: { schemaName: string; system: string; prompt: string; jsonSchema: object }): Promise<{ data: T; model: string }>;
}

export interface CallAnalysis extends AIIntentResult {
  qaScore: number; // 0..100
  complianceFlags: { code: string; description: string; confidence: number }[];
  coaching: string[];
}

export interface VoiceAgentTool {
  name: "book_appointment" | "schedule_callback" | "handoff_to_human" | "mark_dnc" | "end_call";
  /** Tools call deterministic DialBrio services; ComplianceGate still applies. */
  description: string;
}

export interface VoiceAgentProvider {
  readonly name: string;
  startSession(input: { callId: ID; campaignId: ID; persona: string; tools: VoiceAgentTool[]; mediaStreamUrl: string }): Promise<{ sessionId: string }>;
  endSession(sessionId: string): Promise<void>;
}
