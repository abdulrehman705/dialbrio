"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ParallelLines, CampaignDraft, ContactQuery, ConversationFilter, DateRange, DialQueue, DispositionInput, ReportParams } from "@dialbrio/types";
import { api } from "@/lib/api";
import { useShellStore } from "@/lib/stores/shell";
import { qk } from "./keys";

export { qk };

/** Active sub-account id; every tenant-scoped query key includes it. */
export function useSubAccount() {
  return useShellStore((s) => s.subAccountId);
}

// ── Session ────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({ queryKey: qk.me, queryFn: api.getMe, staleTime: 5 * 60_000 });
}

// ── Overview ───────────────────────────────────────────────────────────
export function useOverview(range: DateRange) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.overview(sub, range), queryFn: () => api.getOverview(range), placeholderData: keepPreviousData });
}

/** Live agent activity. Real-time source is SSE `agent.status_changed`; this refetch is a safety net. */
export function useAgentActivity() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.agents(sub), queryFn: api.getAgentActivity, refetchInterval: 60_000 });
}

// ── Contacts ───────────────────────────────────────────────────────────
export function useContacts(q: ContactQuery) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.contacts(sub, q), queryFn: () => api.listContacts(q), placeholderData: keepPreviousData });
}
export function useContact(id: string | null) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.contact(sub, id ?? ""), queryFn: () => api.getContact(id!), enabled: !!id });
}
export function useContactTimeline(id: string | null) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.contactTimeline(sub, id ?? ""), queryFn: () => api.getContactTimeline(id!), enabled: !!id });
}
export function useContactCalls(id: string | null) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.contactCalls(sub, id ?? ""), queryFn: () => api.getContactCalls(id!), enabled: !!id });
}

// ── Campaigns ──────────────────────────────────────────────────────────
export function useCampaigns() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.campaigns(sub), queryFn: api.listCampaigns });
}
export function useCreateCampaign() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: ({ draft, launch }: { draft: CampaignDraft; launch: boolean }) => api.createCampaign(draft, launch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.campaigns(sub) }),
  });
}
export function useSetCampaignStatus() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" }) => api.setCampaignStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.campaigns(sub) }),
  });
}

// ── Queues ─────────────────────────────────────────────────────────────
export function useQueues() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.queues(sub), queryFn: api.listQueues });
}
export function useQueueStats() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.queueStats(sub), queryFn: api.getQueueStats, refetchInterval: 30_000 });
}
export function useQueueItems(queueId: string | null) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.queueItems(sub, queueId ?? ""), queryFn: () => api.getQueueItems(queueId!), enabled: !!queueId });
}
/** Optimistic reorder: safe because ordering is idempotent and the server response replaces it. */
export function useReorderQueues() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: (ids: string[]) => api.reorderQueues(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: qk.queues(sub) });
      const prev = qc.getQueryData<DialQueue[]>(qk.queues(sub));
      if (prev) qc.setQueryData(qk.queues(sub), ids.map((id, i) => ({ ...prev.find((q) => q.id === id)!, priority: i + 1 })));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(qk.queues(sub), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.queues(sub) }),
  });
}
export function useUpdateQueue() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof api.updateQueue>[1] }) => api.updateQueue(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.queues(sub) });
      void qc.invalidateQueries({ queryKey: qk.queueStats(sub) });
    },
  });
}

// ── Dialer ─────────────────────────────────────────────────────────────
export function useDialerSession() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.dialerSession(sub), queryFn: api.getDialerSession });
}
export function usePlaybook(campaignId: string | undefined) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.playbook(sub, campaignId ?? ""), queryFn: () => api.getPlaybook(campaignId!), enabled: !!campaignId, staleTime: 10 * 60_000 });
}
/** Reserves the next eligible lead. A mutation (not a query) because reservation has side effects. */
export function useReserveNextLead() {
  return useMutation({ mutationFn: (sessionId: string) => api.getNextLead(sessionId) });
}
export function useStartCall() {
  return useMutation({ mutationFn: (v: { sessionId: string; contactId: string; callerId: string }) => api.startCall(v.sessionId, v.contactId, v.callerId) });
}
export function useEndCall() {
  return useMutation({ mutationFn: (callId: string) => api.endCall(callId) });
}
export function useSubmitDisposition() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: ({ callId, input }: { callId: string; input: DispositionInput }) => api.submitDisposition(callId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.dialerSession(sub) }),
  });
}
export function useSetCallerId() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: ({ sessionId, number }: { sessionId: string; number: string }) => api.setCallerId(sessionId, number),
    onSuccess: (s) => qc.setQueryData(qk.dialerSession(sub), s),
  });
}

// ── Conversations ──────────────────────────────────────────────────────
export function useConversations(filter: ConversationFilter, q?: string) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.conversations(sub, filter, q), queryFn: () => api.listConversations(filter, q), placeholderData: keepPreviousData });
}
export function useConversationEntries(id: string | null) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.conversationEntries(sub, id ?? ""), queryFn: () => api.getConversationEntries(id!), enabled: !!id });
}
export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: (body: string) => api.sendMessage(conversationId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.conversationEntries(sub, conversationId) });
      void qc.invalidateQueries({ queryKey: ["conversations", sub] });
    },
  });
}
export function useMarkConversationRead() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: (id: string) => api.markConversationRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["conversations", sub] }),
  });
}

// ── Analytics & operations ─────────────────────────────────────────────
export function useReport(p: ReportParams) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.report(sub, p), queryFn: () => api.getReport(p), placeholderData: keepPreviousData });
}
/** Organization-level (not sub-account) billing. */
export function useBilling() {
  return useQuery({ queryKey: qk.billing("org"), queryFn: api.getBilling });
}
export function useSetSessionLines() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: ({ sessionId, lines }: { sessionId: string; lines: ParallelLines }) => api.setSessionLines(sessionId, lines),
    onSuccess: (s) => qc.setQueryData(qk.dialerSession(sub), s),
  });
}
export function useDropVoicemail() {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: (callId: string) => api.dropVoicemail(callId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.dialerSession(sub) }),
  });
}

export function useIntegrations() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.integrations(sub), queryFn: api.listIntegrations });
}
export function usePhoneNumbers() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.numbers(sub), queryFn: api.listPhoneNumbers });
}
export function useAppointments() {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.appointments(sub), queryFn: api.listAppointments });
}

export type { DateRange, ContactQuery, ConversationFilter, ReportParams };

// ── Settings ───────────────────────────────────────────────────────────
export function useSettings(section: import("@dialbrio/types").SettingsSection) {
  const sub = useSubAccount();
  return useQuery({ queryKey: qk.settings(sub, section), queryFn: () => api.getSettings(section) });
}
export function useUpdateSettings(section: import("@dialbrio/types").SettingsSection) {
  const qc = useQueryClient();
  const sub = useSubAccount();
  return useMutation({
    mutationFn: (values: import("@dialbrio/types").SettingsValues) => api.updateSettings(section, values),
    onSuccess: (data) => qc.setQueryData(qk.settings(sub, section), data),
  });
}
