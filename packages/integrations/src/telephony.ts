import type { ISODateString } from "@dialbrio/types";

/** Telephony boundary. Implementation: TwilioProvider (Phase 3). */
export type ProviderCallStatus = "queued" | "initiated" | "ringing" | "in-progress" | "completed" | "busy" | "no-answer" | "failed" | "canceled";

export interface CreateCallInput {
  from: string; // E.164 caller ID, already validated by ComplianceGate
  to: string;
  /** Agent WebRTC identity for human strategy, or media-stream URL for AI strategy. */
  bridgeTo: { kind: "client"; identity: string } | { kind: "stream"; url: string };
  statusCallbackUrl: string;
  record: boolean;
  machineDetection?: "off" | "detect";
  idempotencyKey: string;
}

export interface SendSMSInput { from: string; to: string; body: string; statusCallbackUrl: string; idempotencyKey: string }

export interface TelephonyProvider {
  readonly provider: "twilio";
  createCall(input: CreateCallInput): Promise<{ providerCallId: string }>;
  endCall(providerCallId: string): Promise<void>;
  sendSMS(input: SendSMSInput): Promise<{ providerMessageId: string }>;
  getRecording(providerRecordingId: string): Promise<{ url: string; durationSec: number; expiresAt: ISODateString }>;
  getCallStatus(providerCallId: string): Promise<{ status: ProviderCallStatus; durationSec?: number; errorCode?: string; errorMessage?: string }>;
}
