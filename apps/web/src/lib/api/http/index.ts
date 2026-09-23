import type { DialBrioApi } from "../types";
import { ApiError } from "../types";
import type { ApiErrorBody } from "@dialbrio/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit & { idempotent?: boolean }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");
  if (init?.method && init.method !== "GET" && init.idempotent !== false) headers.set("Idempotency-Key", crypto.randomUUID());

  // Session is an HTTP-only cookie; CSRF token is read from a non-HTTP-only cookie (double submit).
  const csrf = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )db_csrf=([^;]+)/)?.[1] : undefined;
  if (csrf) headers.set("X-CSRF-Token", decodeURIComponent(csrf));

  const res = await fetch(`${BASE}/v1${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(body?.error.code ?? "http_error", body?.error.message ?? res.statusText, res.status, body?.error.requestId);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

const qs = (o: Record<string, unknown>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

/** Real API implementation (Phase 1+). Endpoints follow docs/architecture.md §6. */
export const httpApi: DialBrioApi = {
  getMe: () => request("/me"),
  getOverview: (range) => request(`/dashboard/overview${qs({ range })}`),
  getAgentActivity: () => request("/agents/activity"),

  listContacts: (q) => request(`/contacts${qs({ ...q })}`),
  getContact: (id) => request(`/contacts/${id}`),
  getContactTimeline: (id) => request(`/contacts/${id}/timeline`),
  getContactCalls: (id) => request(`/contacts/${id}/calls`),

  listCampaigns: () => request("/campaigns"),
  getCampaign: (id) => request(`/campaigns/${id}`),
  createCampaign: (draft, launch) => request(`/campaigns${qs({ launch })}`, { method: "POST", body: JSON.stringify(draft) }),
  setCampaignStatus: (id, status) => request(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  listQueues: () => request("/queues"),
  getQueueStats: () => request("/queues/stats"),
  getQueueItems: (id) => request(`/queues/${id}/items`),
  reorderQueues: (orderedIds) => request("/queues/order", { method: "PUT", body: JSON.stringify({ orderedIds }) }),
  updateQueue: (id, patch) => request(`/queues/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  getDialerSession: () => request("/dialer/sessions/current"),
  getNextLead: (sessionId) => request(`/dialer/sessions/${sessionId}/next`, { method: "POST" }),
  getPlaybook: (campaignId) => request(`/campaigns/${campaignId}/playbook`),
  startCall: (sessionId, contactId, callerId) => request(`/dialer/sessions/${sessionId}/calls`, { method: "POST", body: JSON.stringify({ contactId, callerId }) }),
  endCall: (callId) => request(`/calls/${callId}/end`, { method: "POST" }),
  submitDisposition: (callId, input) => request(`/calls/${callId}/disposition`, { method: "POST", body: JSON.stringify(input) }),
  setSessionLines: (sessionId, lines) => request(`/dialer/sessions/${sessionId}`, { method: "PATCH", body: JSON.stringify({ lines }) }),
  dropVoicemail: (callId) => request(`/calls/${callId}/voicemail-drop`, { method: "POST" }),
  setCallerId: (sessionId, number) => request(`/dialer/sessions/${sessionId}`, { method: "PATCH", body: JSON.stringify({ callerId: number }) }),

  listConversations: (filter, q) => request(`/conversations${qs({ filter, q })}`),
  getConversationEntries: (id) => request(`/conversations/${id}/entries`),
  sendMessage: (id, body) => request(`/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ body }) }),
  markConversationRead: (id) => request(`/conversations/${id}/read`, { method: "POST", idempotent: false }),

  getReport: (p) => request(`/analytics/report${qs({ ...p })}`),

  listIntegrations: () => request("/integrations"),
  listPhoneNumbers: () => request("/phone-numbers"),
  listAppointments: () => request("/appointments"),
  getBilling: () => request("/billing/overview"),

  getSettings: (section) => request(`/settings/${section}`),
  updateSettings: (section, values) => request(`/settings/${section}`, { method: "PATCH", body: JSON.stringify(values) }),
};
