/**
 * Mock implementation of DialBrioApi. DEMO ONLY.
 * Simulates latency and in-memory mutations; the dialer call lifecycle is driven through `mockRealtime`
 * exactly as the real SSE stream would deliver it.
 */
import type { Campaign, ConversationEntry, ReportParams, DialerSession, DialQueue, LeadState, NumberHealth, OverviewData, Report } from "@dialbrio/types";
import { DISPOSITION_CODES, PLANS, USAGE_RATES } from "@dialbrio/types";
import type { BillingOverview } from "@dialbrio/types";
import { mockRealtime } from "@/lib/realtime";
import type { DialBrioApi } from "../types";
import { ApiError } from "../types";
import * as db from "./seed";
import { settingsStore } from "./settings-seed";

const latency = (min = 180, max = 520) => new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
async function respond<T>(value: T, min?: number, max?: number): Promise<T> {
  await latency(min, max);
  return structuredClone(value);
}

const count = <T,>(arr: T[], fn: (x: T) => boolean) => arr.reduce((n, x) => n + (fn(x) ? 1 : 0), 0);

let session: DialerSession = {
  id: "ses_1",
  campaign: { id: "cmp_1", name: "Solar Inbound — Web Leads", dialMode: "power", dialStrategy: "human" },
  callerId: "+13035550142",
  callerIds: db.phoneNumbers
    .filter((n) => n.status === "active" && n.capabilities.includes("voice"))
    .slice(0, 6)
    .map((n) => ({ number: n.number, label: n.friendlyName, health: n.health })),
  queueName: "Speed to Lead — Fresh",
  queueWaiting: 23,
  startedAt: db.iso(47 * 60_000),
  stats: { calls: 38, connected: 11, appointments: 2, talkTimeSec: 2412, voicemailsDropped: 6 },
  autoDialNext: false,
  lines: 1,
  maxLines: 4,
  voicemailDrop: { id: "vm_1", name: "Maya — solar follow-up", durationSec: 24 },
};

let leadCursor = 0;
const activeCalls = new Map<string, { timers: ReturnType<typeof setTimeout>[]; contactId: string }>();

function simulateCall(callId: string, contactId: string) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
  const emit = mockRealtime.emit.bind(mockRealtime);
  const outcome = contactId === "con_0003" ? "no_answer" : "connect";

  at(0, () => emit({ type: "call.state_changed", callId, state: "preparing" }));
  at(700, () => emit({ type: "call.state_changed", callId, state: "dialing" }));
  at(1500, () => emit({ type: "call.state_changed", callId, state: "ringing" }));
  if (outcome === "no_answer") {
    at(7500, () => {
      emit({ type: "call.state_changed", callId, state: "failed", providerReason: "No answer after 30 seconds (carrier: no-answer)", retryable: true });
      activeCalls.delete(callId);
    });
  } else {
    at(4200, () => emit({ type: "call.state_changed", callId, state: "connected" }));
    db.transcriptScript.forEach((seg, i) => {
      at(4200 + seg.atSec * 900, () => emit({ type: "call.transcript", callId, segment: { ...seg, id: `${callId}_seg${i}` } }));
    });
    const levels = setInterval(() => emit({ type: "call.audio_level", callId, level: Math.random() }), 160);
    timers.push(levels as unknown as ReturnType<typeof setTimeout>);
  }
  activeCalls.set(callId, { timers, contactId });
}

function stopCall(callId: string) {
  const c = activeCalls.get(callId);
  if (!c) return;
  c.timers.forEach((t) => {
    clearTimeout(t);
    clearInterval(t as unknown as ReturnType<typeof setInterval>);
  });
  activeCalls.delete(callId);
}

/** Share of sub-account volume attributable to a scope (agent/campaign/number) — keeps demo numbers coherent. */
function scopeShare(p: ReportParams): number {
  if (!p.scopeId) return 1;
  if (p.scope === "agent") {
    const a = db.agentActivity.find((x) => x.userId === p.scopeId);
    const total = db.agentActivity.reduce((s, x) => s + x.callsToday, 0);
    return a && total ? a.callsToday / total : 0;
  }
  if (p.scope === "campaign") {
    const c = db.campaigns.find((x) => x.id === p.scopeId);
    const total = db.campaigns.reduce((s, x) => s + x.attempts, 0);
    return c && total ? c.attempts / total : 0;
  }
  if (p.scope === "number") {
    const n = db.phoneNumbers.find((x) => x.id === p.scopeId || x.number === p.scopeId);
    const total = db.phoneNumbers.reduce((s, x) => s + x.dailyCalls, 0);
    return n && total ? n.dailyCalls / total : 0;
  }
  return 1;
}

function scaleReport(r: Report, k: number, p: ReportParams): Report {
  if (k === 1) return r;
  const m = (n: number) => Math.round(n * k);
  const scaleTotals = (t: Report["totals"]) => ({ ...t, calls: m(t.calls), connected: m(t.connected), talkTimeSec: m(t.talkTimeSec), appointments: m(t.appointments), retries: m(t.retries), noAnswers: m(t.noAnswers), dnc: m(t.dnc), agentIdleSec: p.scope === "agent" ? Math.round(t.agentIdleSec / db.agentActivity.length) : t.agentIdleSec });
  return {
    ...r,
    totals: scaleTotals(r.totals),
    previous: scaleTotals(r.previous),
    series: r.series.map((x) => ({ ...x, calls: m(x.calls), connected: m(x.connected), appointments: m(x.appointments) })),
    dispositions: r.dispositions.map((d) => ({ ...d, count: m(d.count) })),
    speedToLeadBuckets: r.speedToLeadBuckets.map((b) => ({ ...b, leads: m(b.leads) })),
    agents: p.scope === "agent" ? r.agents.filter((a) => a.userId === p.scopeId) : r.agents,
    campaigns: p.scope === "campaign" ? r.campaigns.filter((c) => c.campaignId === p.scopeId) : r.campaigns,
  };
}

function reportFor(range: string): Report {
  const days = range === "today" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const scale = days === 1 ? 1 : days * 0.92;
  const calls = Math.round(1284 * scale);
  const connected = Math.round(calls * 0.297);
  const appts = Math.round(connected * 0.118);
  const totals = {
    calls,
    connected,
    connectRate: connected / calls,
    talkTimeSec: connected * 214,
    avgCallSec: 214,
    appointments: appts,
    appointmentRate: appts / connected,
    speedToLeadSec: 94,
    retries: Math.round(calls * 0.41),
    noAnswers: Math.round(calls * 0.52),
    dnc: Math.round(calls * 0.006),
    agentIdleSec: Math.round(7 * 3600 * 0.18 * Math.max(1, days * 0.7)),
  };
  const previous = { ...totals, calls: Math.round(calls * 0.93), connected: Math.round(connected * 0.9), connectRate: (connected * 0.9) / (calls * 0.93), appointments: Math.round(appts * 0.86), appointmentRate: (appts * 0.86) / (connected * 0.9), speedToLeadSec: 131, agentIdleSec: Math.round(totals.agentIdleSec * 1.12), talkTimeSec: Math.round(totals.talkTimeSec * 0.91), retries: Math.round(totals.retries * 1.04), noAnswers: Math.round(totals.noAnswers * 1.02), dnc: totals.dnc + 1 };
  const points = days === 1 ? 12 : days;
  const series = Array.from({ length: points }, (_, i) => {
    const wave = 0.8 + 0.25 * Math.sin(i / 2.3) + (i / points) * 0.15;
    const c = Math.round((days === 1 ? 110 : 1250) * wave);
    const conn = Math.round(c * (0.27 + 0.05 * Math.cos(i)));
    const label = days === 1 ? db.hourlyActivity[i]!.hour : new Date(db.NOW - (points - 1 - i) * 86400000).toISOString().slice(0, 10);
    return { date: label, calls: c, connected: conn, appointments: Math.round(conn * 0.12) };
  });
  return {
    totals,
    previous,
    series,
    connectByHour: db.hourlyActivity.map((h, i) => ({ hour: h.hour, rate: [0.22, 0.31, 0.34, 0.3, 0.24, 0.27, 0.33, 0.36, 0.38, 0.35, 0.29, 0.21][i]! })),
    dispositions: DISPOSITION_CODES.map((code) => ({
      code,
      count: Math.round(calls * { interested: 0.07, appointment: 0.035, callback: 0.05, no_answer: 0.52, busy: 0.06, voicemail: 0.17, not_interested: 0.06, wrong_number: 0.02, dnc: 0.006 }[code]),
    })),
    agents: db.agentActivity
      .filter((a) => a.status !== "offline")
      .map((a) => ({ userId: a.userId, name: a.name, initials: a.initials, calls: Math.round(a.callsToday * scale), connected: Math.round(a.connectsToday * scale), appointments: Math.round(a.appointmentsToday * scale), talkTimeSec: Math.round(a.talkTimeSec * scale), idleSec: Math.round((1800 + (a.name.length % 5) * 420) * scale) })),
    campaigns: db.campaigns
      .filter((c) => c.attempts > 0)
      .map((c) => ({ campaignId: c.id, name: c.name, calls: c.attempts, connectRate: c.connected / c.attempts, appointments: c.appointments, appointmentRate: c.connected ? c.appointments / c.connected : 0 })),
    speedToLeadBuckets: [
      { bucket: "< 1 min", leads: 142 },
      { bucket: "1–5 min", leads: 211 },
      { bucket: "5–15 min", leads: 64 },
      { bucket: "15–60 min", leads: 22 },
      { bucket: "> 1 hr", leads: 9 },
    ],
  };
}

function splitByClient(usageCents: number): BillingOverview["bySubAccount"] {
  const clients = [
    { subAccountId: "sub_1", name: "Summit Solar", minutes: 24610, sms: 3310, numbers: 7, markup: 1.74 },
    { subAccountId: "sub_2", name: "Apex Home Services", minutes: 12440, sms: 1990, numbers: 3, markup: 1.68 },
    { subAccountId: "sub_3", name: "Brightline Insurance", minutes: 8150, sms: 840, numbers: 2, markup: 1.63 },
  ];
  const totalMin = clients.reduce((n, c) => n + c.minutes, 0);
  let allocated = 0;
  return clients.map(({ markup, ...c }, i) => {
    const costCents = i === clients.length - 1 ? usageCents - allocated : Math.round((usageCents * c.minutes) / totalMin);
    allocated += costCents;
    return { ...c, costCents, rebilledCents: Math.round(costCents * markup) };
  });
}

function billingOverview(): BillingOverview {
  const plan = PLANS.find((p) => p.id === "agency")!;
  const rate = (id: string) => USAGE_RATES.find((r) => r.id === id)!;
  const line = (id: BillingOverview["usage"][number]["id"], quantity: number, included = 0) => {
    const r = rate(id);
    const billable = Math.max(0, quantity - included);
    return { id, label: r.label, quantity, included, rate: r.rate, amountCents: Math.round((billable * r.unitMilliCents) / 100) };
  };
  const usage = [line("outbound_min", 41280), line("inbound_min", 3920), line("sms_segment", 6140), line("local_number", 12), line("ai_min", 640, plan.includedAiMinutes ?? 0)];
  const seats = { included: plan.includedSeats ?? 0, used: 12, extra: 2 };
  const seatsCents = seats.extra * 5900;
  const usageCents = usage.reduce((s, u) => s + u.amountCents, 0);
  return {
    planId: plan.id,
    interval: "monthly",
    periodStart: new Date(db.NOW - 9 * 86400000).toISOString(),
    periodEnd: new Date(db.NOW + 21 * 86400000).toISOString(),
    seats,
    subAccounts: db.me.subAccounts.length,
    usage,
    platformCents: plan.monthlyCents ?? 0,
    seatsCents,
    usageCents,
    estimatedTotalCents: (plan.monthlyCents ?? 0) + seatsCents + usageCents,
    spendCapCents: 250000,
    // Split the metered usage across clients by minutes so per-client cost reconciles with the invoice.
    bySubAccount: splitByClient(usageCents),
    invoices: [
      { id: "in_2026_08", period: "Aug 2026", totalCents: 131210, status: "paid" },
      { id: "in_2026_07", period: "Jul 2026", totalCents: 118940, status: "paid" },
      { id: "in_2026_06", period: "Jun 2026", totalCents: 97420, status: "paid" },
    ],
    paymentMethod: { brand: "Visa", last4: "4242", expires: "08/28" },
  };
}

export const mockApi: DialBrioApi = {
  getMe: () => respond(db.me, 80, 160),

  async getOverview(range) {
    const lifecycle = { fresh: 0, warm: 0, aged: 0, zombie: 0 } as Record<LeadState, number>;
    db.contacts.forEach((c) => lifecycle[c.leadState]++);
    // scale to realistic sub-account volumes
    (Object.keys(lifecycle) as LeadState[]).forEach((k) => (lifecycle[k] = lifecycle[k] * 23 + (k === "fresh" ? 11 : 0)));
    const nh = { healthy: 0, watch: 0, at_risk: 0, cooling_down: 0 } as Record<NumberHealth, number>;
    db.phoneNumbers.forEach((n) => nh[n.health]++);
    const active = count(db.agentActivity, (a) => a.status !== "offline" && a.status !== "break");
    const data: OverviewData = {
      kpis: {
        callsToday: { value: 1284, previous: 1172 },
        connectRate: { value: 0.297, previous: 0.281 },
        appointments: { value: 43, previous: 37 },
        speedToLeadSec: { value: 94, previous: 131 },
        activeAgents: { value: active, previous: 6, total: db.users.length },
        queueWaiting: { value: db.queues.filter((q) => q.enabled).reduce((s, q) => s + q.waiting, 0), previous: 241, oldestMinutes: 164 },
      },
      callActivity: db.hourlyActivity,
      queueHealth: db.queues.map((q) => ({ queueId: q.id, name: q.name, waiting: q.waiting, oldestMinutes: q.oldestWaitMinutes, slaMinutes: q.id === "q_2" ? 5 : q.id === "q_1" ? 15 : 120, enabled: q.enabled })),
      lifecycle,
      funnel: [
        { stage: "Leads", value: 1842 },
        { stage: "Contacted", value: 1284 },
        { stage: "Connected", value: 381 },
        { stage: "Qualified", value: 126 },
        { stage: "Appointments", value: 43 },
      ],
      numberHealth: nh,
      recentConversations: db.conversations.slice(0, 6),
      attention: [
        { id: "at_1", severity: "critical", kind: "crm_sync", title: "GoHighLevel sync failed for 3 contacts", detail: "Custom field “Monthly bill” expects a number; DialBrio sent text. Outcomes are queued and will retry.", at: db.iso(14 * 60_000), action: { label: "Review sync errors", href: "/app/integrations" } },
        { id: "at_2", severity: "critical", kind: "number_health", title: "(720) 555-0117 labeled as spam", detail: "Answer rate fell from 31% to 11% in 48h. Rotate it out of Facebook Lead Ads — Q3.", at: db.iso(52 * 60_000), action: { label: "View number", href: "/app/numbers" } },
        { id: "at_3", severity: "warning", kind: "stale_queue", title: "Aged revival has 186 leads waiting", detail: "Oldest lead has waited 2h 44m. Only 3 agents are assigned.", at: db.iso(20 * 60_000), action: { label: "Open queue", href: "/app/queue" } },
        { id: "at_4", severity: "warning", kind: "a2p", title: "A2P 10DLC campaign registration pending", detail: "SMS from (720) 555-0108 is limited until carriers approve the campaign (typically 3–7 days).", at: db.iso(26 * 3600_000), action: { label: "View compliance", href: "/app/compliance" } },
        { id: "at_5", severity: "info", kind: "campaign_exhausted", title: "Summer Promo 2026 is exhausted", detail: "All 540 leads reached max attempts. 38 were moved to Zombie.", at: db.iso(5 * 3600_000), action: { label: "View campaign", href: "/app/campaigns" } },
        { id: "at_6", severity: "info", kind: "usage_limit", title: "86% of monthly call minutes used", detail: "41,280 of 48,000 minutes · resets Oct 14.", at: db.iso(3 * 3600_000), action: { label: "View billing", href: "/app/billing" } },
      ],
    };
    void range;
    return respond(data);
  },

  getAgentActivity: () => respond(db.agentActivity),

  async listContacts({ page = 1, pageSize = 25, q, leadState, campaignId, ownerId }) {
    let rows = db.contacts;
    if (q) {
      const needle = q.toLowerCase().replace(/[^\da-z@.\s]/g, "");
      rows = rows.filter((c) => `${c.firstName} ${c.lastName} ${c.email ?? ""} ${c.phone}`.toLowerCase().includes(needle));
    }
    if (leadState) rows = rows.filter((c) => c.leadState === leadState);
    if (campaignId) rows = rows.filter((c) => c.campaignId === campaignId);
    if (ownerId) rows = rows.filter((c) => c.ownerId === ownerId);
    return respond({ items: rows.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: rows.length });
  },
  async getContact(id) {
    const c = db.contacts.find((x) => x.id === id);
    if (!c) throw new ApiError("not_found", "Contact not found", 404);
    return respond(c);
  },
  async getContactTimeline(id) {
    const c = db.contacts.find((x) => x.id === id);
    return respond(c ? db.contactTimeline(c) : []);
  },
  async getContactCalls(id) {
    const c = db.contacts.find((x) => x.id === id);
    return respond(c ? db.contactCalls(c) : []);
  },

  listCampaigns: () => respond(db.campaigns),
  async getCampaign(id) {
    const c = db.campaigns.find((x) => x.id === id);
    if (!c) throw new ApiError("not_found", "Campaign not found", 404);
    return respond(c);
  },
  async createCampaign(draft, launch) {
    // Callbacks are system-generated; match lifecycle queues by overlap with the draft's lead states.
    const overlap = (q: DialQueue) => q.leadStates.filter((s) => draft.leadStates.includes(s)).length;
    const queue = db.queues.filter((q) => q.id !== "q_1").sort((a, b) => overlap(b) - overlap(a) || a.priority - b.priority)[0] ?? db.queues[1]!;
    const c: Campaign = {
      id: `cmp_${db.campaigns.length + 1}`,
      subAccountId: db.me.activeSubAccountId,
      name: draft.name,
      status: launch ? "active" : "draft",
      dialStrategy: draft.dialStrategy,
      dialMode: draft.dialMode,
      lines: draft.dialMode === "parallel" ? draft.lines : undefined,
      speedToLead: draft.speedToLead,
      voicemailDrop: draft.followUp.voicemailDrop,
      queueId: queue.id,
      queueName: queue.name,
      leads: 0,
      attempts: 0,
      connected: 0,
      appointments: 0,
      agentIds: draft.agentIds,
      callerIds: draft.callerIds,
      createdAt: new Date().toISOString(),
      leadSource: `${draft.leadSource.type.replace("ghl_", "GHL ").replace("_", " ")}: ${draft.leadSource.value}`,
    };
    db.campaigns.unshift(c);
    return respond(c, 500, 900);
  },
  async setCampaignStatus(id, status) {
    const c = db.campaigns.find((x) => x.id === id);
    if (!c) throw new ApiError("not_found", "Campaign not found", 404);
    c.status = status;
    return respond(c);
  },

  listQueues: () => respond([...db.queues].sort((a, b) => a.priority - b.priority)),
  getQueueStats: () =>
    respond({
      waiting: db.queues.filter((q) => q.enabled).reduce((s, q) => s + q.waiting, 0),
      activeCalls: count(db.agentActivity, (a) => a.status === "on_call"),
      availableAgents: count(db.agentActivity, (a) => a.status === "available"),
      oldestLeadMinutes: Math.max(...db.queues.filter((q) => q.enabled).map((q) => q.oldestWaitMinutes)),
      avgWaitMinutes: 18.6,
      throughputPerHour: db.queues.reduce((s, q) => s + q.throughputPerHour, 0),
      byState: { fresh: 23, warm: 45, aged: 186, zombie: 612 },
    }),
  async getQueueItems(queueId) {
    const q = db.queues.find((x) => x.id === queueId);
    return respond(q ? db.queueItemsFor(q) : []);
  },
  async reorderQueues(orderedIds) {
    orderedIds.forEach((id, i) => {
      const q = db.queues.find((x) => x.id === id);
      if (q) q.priority = i + 1;
    });
    return respond([...db.queues].sort((a, b) => a.priority - b.priority), 150, 300);
  },
  async updateQueue(id, patch) {
    const q = db.queues.find((x) => x.id === id) as DialQueue | undefined;
    if (!q) throw new ApiError("not_found", "Queue not found", 404);
    Object.assign(q, patch);
    return respond(q);
  },

  getDialerSession: () => respond(session),
  async getNextLead() {
    const id = db.dialerLeadOrder[leadCursor % db.dialerLeadOrder.length]!;
    leadCursor++;
    const contact = db.contacts.find((c) => c.id === id)!;
    const timeline = db.contactTimeline(contact);
    const lastConnected = timeline.find((e) => e.kind === "connected");
    return respond(
      {
        contact,
        queueReason: db.queueReasons[id] ?? `${contact.leadState === "fresh" ? "Fresh" : "Warm"} lead · ${contact.attempts} attempts · ${session.queueName}`,
        lastConversation: lastConnected
          ? { at: lastConnected.at, summary: contact.aiSummary?.text ?? lastConnected.detail ?? "Connected call", agentName: contact.ownerName ?? "Maya Chen", disposition: contact.stage === "callback" ? "callback" : "interested" }
          : undefined,
        history: timeline,
        complianceBlock: db.complianceBlocks[id],
      },
      250,
      450,
    );
  },
  getPlaybook: () => respond(db.playbook, 120, 240),
  async startCall(_sessionId, contactId) {
    const c = db.contacts.find((x) => x.id === contactId);
    if (db.complianceBlocks[contactId]) throw new ApiError("compliance_blocked", db.complianceBlocks[contactId]!.message, 409);
    if (c?.stage === "dnc") throw new ApiError("compliance_blocked", "This number is on the Do Not Call list.", 409);
    const callId = `call_${Date.now().toString(36)}`;
    await latency(120, 200);
    simulateCall(callId, contactId);
    session = { ...session, stats: { ...session.stats, calls: session.stats.calls + 1 } };
    return { callId };
  },
  async endCall(callId) {
    stopCall(callId);
    mockRealtime.emit({ type: "call.state_changed", callId, state: "wrapping_up" });
    await latency(80, 150);
  },
  async submitDisposition(callId, input) {
    stopCall(callId);
    const connected = ["interested", "appointment", "callback", "not_interested", "dnc", "wrong_number"].includes(input.code);
    session = {
      ...session,
      stats: {
        ...session.stats,
        connected: session.stats.connected + (connected ? 1 : 0),
        appointments: session.stats.appointments + (input.code === "appointment" ? 1 : 0),
        talkTimeSec: session.stats.talkTimeSec + (connected ? 180 : 0),
      },
      queueWaiting: Math.max(0, session.queueWaiting - 1),
    };
    const nextAction =
      input.code === "callback"
        ? { type: "callback" as const, label: "Callback scheduled", at: input.callbackAt }
        : input.code === "appointment"
          ? { type: "appointment" as const, label: "Appointment booked in GHL calendar", at: input.appointment?.startsAt }
          : input.code === "no_answer" || input.code === "busy"
            ? { type: "retry" as const, label: input.code === "busy" ? "Retry in 15 min" : "Retry in 30 min, then SMS" }
            : input.code === "voicemail"
              ? { type: "sms" as const, label: "Voicemail SMS sent · retry tomorrow" }
              : input.code === "dnc"
                ? { type: "none" as const, label: "Added to DNC list" }
                : input.code === "interested"
                  ? { type: "call" as const, label: "Follow-up call tomorrow" }
                  : { type: "none" as const, label: "Marked lost" };
    await latency(250, 450);
    return { nextAction };
  },
  async setSessionLines(_id, lines) {
    session = { ...session, lines: Math.min(lines, session.maxLines) as typeof lines };
    return respond(session, 100, 200);
  },
  async dropVoicemail(callId) {
    stopCall(callId);
    mockRealtime.emit({ type: "call.state_changed", callId, state: "completed" });
    session = { ...session, stats: { ...session.stats, voicemailsDropped: session.stats.voicemailsDropped + 1 }, queueWaiting: Math.max(0, session.queueWaiting - 1) };
    await latency(200, 350);
    return { nextAction: { type: "retry" as const, label: "Voicemail left · SMS follow-up in 10 min · retry tomorrow" } };
  },
  async setCallerId(_id, number) {
    session = { ...session, callerId: number };
    return respond(session, 100, 200);
  },

  async listConversations(filter, q) {
    let rows = db.conversations;
    if (filter === "unread") rows = rows.filter((c) => c.unreadCount > 0);
    if (filter === "mine") rows = rows.filter((c) => c.assigneeId === db.me.user.id);
    if (filter === "unassigned") rows = rows.filter((c) => !c.assigneeId);
    if (filter === "team") rows = rows.filter((c) => !!c.assigneeId);
    if (q) {
      const n = q.toLowerCase();
      rows = rows.filter((c) => c.contactName.toLowerCase().includes(n) || c.contactPhone.includes(n.replace(/\D/g, "") || "~") || c.lastMessagePreview.toLowerCase().includes(n));
    }
    return respond(rows);
  },
  getConversationEntries: (id) => respond(db.conversationEntries[id] ?? []),
  async sendMessage(conversationId, body) {
    const conv = db.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new ApiError("not_found", "Conversation not found", 404);
    const entry: ConversationEntry = { id: `${conversationId}_m${Date.now()}`, conversationId, channel: "sms", direction: "outbound", body, status: "sent", at: new Date().toISOString(), agentName: db.me.user.name, fromNumber: conv.numberUsed };
    (db.conversationEntries[conversationId] ??= []).push(entry);
    conv.lastMessagePreview = body;
    conv.lastMessageAt = entry.at;
    conv.lastChannel = "sms";
    await latency(300, 600);
    setTimeout(() => (entry.status = "delivered"), 1500);
    return structuredClone(entry);
  },
  async markConversationRead(id) {
    const c = db.conversations.find((x) => x.id === id);
    if (c) c.unreadCount = 0;
    await latency(50, 100);
  },

  getReport: (p) => respond(scaleReport(reportFor(p.range), scopeShare(p), p), 300, 700),

  listIntegrations: () => respond(db.integrations),
  listPhoneNumbers: () => respond(db.phoneNumbers),
  listAppointments: () => respond(db.appointments),
  getBilling: () => respond(billingOverview()),

  getSettings: (section) => respond(settingsStore[section] ?? {}, 150, 350),
  async updateSettings(section, values) {
    settingsStore[section] = { ...(settingsStore[section] ?? {}), ...structuredClone(values) };
    return respond(settingsStore[section]!, 300, 600);
  },
};
