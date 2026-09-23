/**
 * Seeded demo data. DEMO ONLY — never imported outside lib/api/mock.
 * Deterministic (seeded PRNG) so the demo is stable between reloads; timestamps are relative to load time.
 * All phone numbers use the fictional 555-01XX range.
 */
import type {
  AgentActivity,
  AgentStatus,
  Appointment,
  Call,
  Campaign,
  Contact,
  Conversation,
  ConversationEntry,
  DialQueue,
  DispositionCode,
  Integration,
  LeadStage,
  LeadState,
  Me,
  PhoneNumber,
  Playbook,
  QueueItem,
  TimelineEvent,
  TranscriptSegment,
  User,
} from "@dialbrio/types";

// ── PRNG ─────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260923);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!;
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
function weighted<T>(entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of entries) {
    if ((r -= w) <= 0) return v;
  }
  return entries[0]![0];
}

export const NOW = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
export const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();
export const isoAhead = (msAhead: number) => new Date(NOW + msAhead).toISOString();

// ── Tenancy & users ──────────────────────────────────────────────────────
const userNames = [
  "Maya Chen",
  "Jordan Ellis",
  "Priya Raman",
  "Marcus Webb",
  "Sofia Alvarez",
  "Daniel Kim",
  "Aisha Thompson",
  "Ryan Brooks",
];
const ini = (n: string) => n.split(" ").map((p) => p[0]).join("");

export const users: User[] = userNames.map((name, i) => ({
  id: `usr_${i + 1}`,
  name,
  email: `${name.split(" ")[0]!.toLowerCase()}@northstargrowth.co`,
  initials: ini(name),
}));

export const me: Me = {
  user: users[0]!,
  role: "admin",
  organization: { id: "org_1", name: "Northstar Growth", slug: "northstar" },
  subAccounts: [
    { id: "sub_1", organizationId: "org_1", name: "Summit Solar", timezone: "America/Denver", crmLocationId: "loc_8f2k1" },
    { id: "sub_2", organizationId: "org_1", name: "Apex Home Services", timezone: "America/Phoenix", crmLocationId: "loc_3m9q7" },
    { id: "sub_3", organizationId: "org_1", name: "Brightline Insurance", timezone: "America/Chicago", crmLocationId: "loc_5t1x4" },
  ],
  activeSubAccountId: "sub_1",
};

// ── Phone numbers ────────────────────────────────────────────────────────
const numberSeed: [string, string, PhoneNumber["health"], PhoneNumber["spamLabel"], number, number, string | undefined][] = [
  ["+13035550142", "Denver Main", "healthy", "clean", 184, 0.34, "Solar Inbound — Web Leads"],
  ["+17205550117", "Denver Local 2", "at_risk", "labeled", 212, 0.11, "Facebook Lead Ads — Q3"],
  ["+17205550163", "Denver Local 3", "healthy", "clean", 142, 0.31, "Facebook Lead Ads — Q3"],
  ["+14805550129", "Phoenix Local", "watch", "suspected", 167, 0.19, "Aged Lead Revival"],
  ["+16025550188", "Phoenix Local 2", "healthy", "clean", 96, 0.29, "Aged Lead Revival"],
  ["+18015550174", "Salt Lake Local", "healthy", "clean", 88, 0.33, "Solar Inbound — Web Leads"],
  ["+17025550151", "Las Vegas Local", "cooling_down", "suspected", 0, 0.14, undefined],
  ["+15125550136", "Austin Local", "healthy", "clean", 121, 0.28, "Callback Follow-ups"],
  ["+13035550199", "Callback Line", "healthy", "clean", 64, 0.52, "Callback Follow-ups"],
  ["+17205550108", "SMS Sender", "healthy", "clean", 12, 0.4, "Zombie Reactivation — SMS First"],
  ["+14805550170", "Phoenix Local 3", "watch", "clean", 158, 0.21, "Aged Lead Revival"],
  ["+18005550155", "Toll-free Support", "healthy", "clean", 21, 0.61, undefined],
];

export const phoneNumbers: PhoneNumber[] = numberSeed.map(([number, friendlyName, health, spamLabel, dailyCalls, answerRate, campaignName], i) => ({
  id: `num_${i + 1}`,
  number,
  friendlyName,
  campaignName,
  capabilities: number.startsWith("+1800") ? ["voice"] : ["voice", "sms"],
  health,
  spamLabel,
  a2p: i === 9 ? "pending" : "approved",
  stirShaken: health === "at_risk" ? "B" : "A",
  dailyCalls,
  answerRate,
  status: health === "cooling_down" ? "paused" : "active",
}));

// ── Campaigns & queues ───────────────────────────────────────────────────
export const campaigns: Campaign[] = [
  { id: "cmp_1", subAccountId: "sub_1", name: "Solar Inbound — Web Leads", status: "active", dialStrategy: "human", dialMode: "power", queueId: "q_2", queueName: "Speed to Lead — Fresh", leads: 412, attempts: 1284, connected: 437, appointments: 58, agentIds: ["usr_1", "usr_2", "usr_3", "usr_4"], callerIds: ["+13035550142", "+18015550174"], createdAt: iso(41 * DAY), leadSource: "GHL tag: web-lead" },
  { id: "cmp_2", subAccountId: "sub_1", name: "Facebook Lead Ads — Q3", status: "active", dialStrategy: "human", dialMode: "power", queueId: "q_2", queueName: "Speed to Lead — Fresh", leads: 689, attempts: 2210, connected: 618, appointments: 71, agentIds: ["usr_2", "usr_5", "usr_6"], callerIds: ["+17205550117", "+17205550163"], createdAt: iso(63 * DAY), leadSource: "GHL pipeline: FB Leads" },
  { id: "cmp_3", subAccountId: "sub_1", name: "Aged Lead Revival", status: "active", dialStrategy: "human", dialMode: "preview", queueId: "q_4", queueName: "Aged revival", leads: 1320, attempts: 3104, connected: 402, appointments: 29, agentIds: ["usr_4", "usr_7", "usr_8"], callerIds: ["+14805550129", "+16025550188", "+14805550170"], createdAt: iso(88 * DAY), leadSource: "GHL smart list: No contact 14d+" },
  { id: "cmp_4", subAccountId: "sub_1", name: "Callback Follow-ups", status: "active", dialStrategy: "human", dialMode: "preview", queueId: "q_1", queueName: "Callbacks due", leads: 96, attempts: 188, connected: 121, appointments: 34, agentIds: ["usr_1", "usr_3"], callerIds: ["+13035550199", "+15125550136"], createdAt: iso(120 * DAY), leadSource: "DialBrio callbacks" },
  { id: "cmp_5", subAccountId: "sub_1", name: "Zombie Reactivation — SMS First", status: "paused", dialStrategy: "human", dialMode: "preview", queueId: "q_5", queueName: "Zombie reactivation", leads: 2140, attempts: 860, connected: 74, appointments: 6, agentIds: ["usr_8"], callerIds: ["+17205550108"], createdAt: iso(30 * DAY), leadSource: "Lifecycle: Zombie" },
  { id: "cmp_6", subAccountId: "sub_1", name: "Referral Program", status: "draft", dialStrategy: "human", dialMode: "preview", queueId: "q_3", queueName: "Warm follow-up", leads: 0, attempts: 0, connected: 0, appointments: 0, agentIds: [], callerIds: [], createdAt: iso(2 * DAY), leadSource: "GHL tag: referral" },
  { id: "cmp_7", subAccountId: "sub_1", name: "Summer Promo 2026", status: "completed", dialStrategy: "human", dialMode: "power", queueId: "q_2", queueName: "Speed to Lead — Fresh", leads: 540, attempts: 1622, connected: 512, appointments: 64, agentIds: ["usr_2", "usr_3", "usr_5"], callerIds: ["+13035550142"], createdAt: iso(110 * DAY), leadSource: "GHL tag: summer-promo" },
  { id: "cmp_8", subAccountId: "sub_1", name: "AI Qualifier Pilot", status: "draft", dialStrategy: "ai", dialMode: "progressive", queueId: "q_4", queueName: "Aged revival", leads: 0, attempts: 0, connected: 0, appointments: 0, agentIds: [], callerIds: [], createdAt: iso(1 * DAY), leadSource: "Lifecycle: Aged" },
];

const standardWindow = { days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "20:00", timezone: "contact" as const };

export const queues: DialQueue[] = [
  { id: "q_1", name: "Callbacks due", priority: 1, enabled: true, leadStates: ["warm", "fresh", "aged"], sources: ["DialBrio callbacks"], campaignIds: ["cmp_4"], maxAttempts: 4, retryRules: [{ disposition: "no_answer", delayMinutes: 30, maxAttempts: 4 }], callingWindow: standardWindow, waiting: 7, oldestWaitMinutes: 12, avgWaitMinutes: 4, throughputPerHour: 18 },
  { id: "q_2", name: "Speed to Lead — Fresh", priority: 2, enabled: true, leadStates: ["fresh"], sources: ["Website form", "Facebook Ads", "Google Ads"], campaignIds: ["cmp_1", "cmp_2"], maxAttempts: 6, retryRules: [{ disposition: "no_answer", delayMinutes: 5, maxAttempts: 3 }, { disposition: "busy", delayMinutes: 10, maxAttempts: 3 }, { disposition: "voicemail", delayMinutes: 120, maxAttempts: 2 }], callingWindow: standardWindow, waiting: 23, oldestWaitMinutes: 9, avgWaitMinutes: 2.4, throughputPerHour: 64 },
  { id: "q_3", name: "Warm follow-up", priority: 3, enabled: true, leadStates: ["warm"], sources: ["Any"], campaignIds: ["cmp_1", "cmp_2", "cmp_6"], maxAttempts: 8, retryRules: [{ disposition: "no_answer", delayMinutes: 240, maxAttempts: 4 }], callingWindow: standardWindow, waiting: 38, oldestWaitMinutes: 47, avgWaitMinutes: 21, throughputPerHour: 22 },
  { id: "q_4", name: "Aged revival", priority: 4, enabled: true, leadStates: ["aged"], sources: ["Any"], campaignIds: ["cmp_3", "cmp_8"], maxAttempts: 10, retryRules: [{ disposition: "no_answer", delayMinutes: 1440, maxAttempts: 6 }, { disposition: "voicemail", delayMinutes: 2880, maxAttempts: 3 }], callingWindow: { ...standardWindow, start: "10:00", end: "19:00" }, waiting: 186, oldestWaitMinutes: 164, avgWaitMinutes: 58, throughputPerHour: 31 },
  { id: "q_5", name: "Zombie reactivation", priority: 5, enabled: false, leadStates: ["zombie"], sources: ["Any"], campaignIds: ["cmp_5"], maxAttempts: 3, retryRules: [{ disposition: "no_answer", delayMinutes: 10080, maxAttempts: 2 }], callingWindow: { ...standardWindow, days: [2, 3, 4], start: "11:00", end: "18:00" }, waiting: 612, oldestWaitMinutes: 0, avgWaitMinutes: 0, throughputPerHour: 0 },
];

// ── Contacts ─────────────────────────────────────────────────────────────
const firstNames = ["James", "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Lucas", "Mia", "Logan", "Harper", "Elijah", "Evelyn", "Carter", "Abigail", "Owen", "Emily", "Wyatt", "Ella", "Caleb", "Scarlett", "Henry", "Grace", "Julian", "Chloe", "Levi", "Zoe", "Isaac", "Nora", "Gabriel", "Riley", "Anthony", "Layla", "Dylan", "Lillian", "Aaron", "Hannah", "Marisol", "Tomas", "Keisha", "Andre", "Mei", "Rohan", "Fatima", "Diego"];
const lastNames = ["Harrison", "Patel", "Nguyen", "Garcia", "Johnson", "Martinez", "Okafor", "Lee", "Walker", "Rivera", "Brooks", "Foster", "Hughes", "Price", "Bennett", "Wood", "Coleman", "Reyes", "Sanders", "Perry", "Long", "Fisher", "Myers", "Hamilton", "Graham", "Sullivan", "Wallace", "West", "Cole", "Jordan", "Reynolds", "Ortiz", "Kim", "Shah", "Morales", "Chavez"];
const places: [string, string, string, string][] = [
  ["Denver", "CO", "303", "America/Denver"],
  ["Aurora", "CO", "720", "America/Denver"],
  ["Boulder", "CO", "303", "America/Denver"],
  ["Phoenix", "AZ", "602", "America/Phoenix"],
  ["Mesa", "AZ", "480", "America/Phoenix"],
  ["Scottsdale", "AZ", "480", "America/Phoenix"],
  ["Salt Lake City", "UT", "801", "America/Denver"],
  ["Las Vegas", "NV", "702", "America/Los_Angeles"],
  ["Austin", "TX", "512", "America/Chicago"],
];
const sources = ["Website form", "Facebook Ads", "Google Ads", "Referral", "GHL import", "Home show"];
const utilities = ["Xcel Energy", "APS", "SRP", "Rocky Mountain Power", "NV Energy", "Austin Energy"];
const roofTypes = ["Asphalt shingle", "Concrete tile", "Metal", "Clay tile"];
const tagPool = ["solar-interest", "homeowner", "high-bill", "financing", "spanish", "ev-owner", "battery-interest", "referral"];

const leadStages: Record<LeadState, [LeadStage, number][]> = {
  fresh: [["new", 6], ["attempting", 4]],
  warm: [["connected", 3], ["qualified", 3], ["callback", 3], ["appointment", 2]],
  aged: [["attempting", 8], ["lost", 1]],
  zombie: [["attempting", 5], ["lost", 2], ["dnc", 1]],
};

const campaignForState: Record<LeadState, Campaign[]> = {
  fresh: [campaigns[0]!, campaigns[1]!],
  warm: [campaigns[0]!, campaigns[1]!, campaigns[3]!],
  aged: [campaigns[2]!],
  zombie: [campaigns[4]!],
};

const summaries = [
  "Homeowner with ~$210/mo bill. Interested in eliminating the bill; spouse needs to be present for consult. Prefers evenings.",
  "Asked about federal tax credit and financing. Concerned about roof age (12 years). Open to a site assessment.",
  "Renting currently — not the decision maker. Landlord contact not provided. Low intent.",
  "Already has two quotes. Price-sensitive; wants to compare panel warranties. Callback requested after 5pm.",
  "Very interested; recently bought an EV and bills went up. Wants battery backup options.",
];

export const contacts: Contact[] = Array.from({ length: 240 }, (_, i) => {
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const [city, state, area, timezone] = pick(places);
  const leadState = weighted<LeadState>([["fresh", 18], ["warm", 22], ["aged", 38], ["zombie", 22]]);
  const stage = weighted(leadStages[leadState]);
  const campaign = pick(campaignForState[leadState]);
  const createdAgo = leadState === "fresh" ? int(3, 23 * 60) * MIN : leadState === "warm" ? int(1, 14) * DAY : leadState === "aged" ? int(2, 29) * DAY : int(31, 180) * DAY;
  const attempts = leadState === "fresh" ? int(0, 2) : leadState === "warm" ? int(1, 6) : leadState === "aged" ? int(1, 8) : int(4, 12);
  const owner = users[int(1, 7)]!;
  const lastContactAgo = attempts === 0 ? undefined : Math.min(createdAgo - MIN, int(10, 60 * 24 * 6) * MIN);
  const hasSummary = leadState === "warm" || rand() > 0.7;
  const nextActions: Contact["nextAction"][] = [
    { type: "call", label: "Call now", at: iso(0) },
    { type: "retry", label: "Retry in 25m", at: isoAhead(25 * MIN) },
    { type: "callback", label: "Callback today 4:30 PM", at: isoAhead(3 * HOUR) },
    { type: "sms", label: "SMS follow-up tomorrow", at: isoAhead(DAY) },
    { type: "appointment", label: "Consult Thu 10:00 AM", at: isoAhead(2 * DAY) },
    { type: "none", label: "No action scheduled" },
  ];
  const nextAction =
    stage === "appointment" ? nextActions[4] : stage === "callback" ? nextActions[2] : stage === "dnc" || stage === "lost" ? nextActions[5] : leadState === "fresh" ? nextActions[attempts === 0 ? 0 : 1] : pick(nextActions.slice(1, 4));

  return {
    id: `con_${String(i + 1).padStart(4, "0")}`,
    subAccountId: "sub_1",
    firstName,
    lastName,
    phone: `+1${area}555${String(100 + ((i * 37) % 100)).padStart(4, "0")}`,
    email: rand() > 0.12 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i % 7 === 0 ? i : ""}@${pick(["gmail.com", "outlook.com", "yahoo.com", "icloud.com"])}` : undefined,
    source: pick(sources),
    leadState,
    stage,
    campaignId: campaign.id,
    campaignName: campaign.name,
    ownerId: owner.id,
    ownerName: owner.name,
    tags: Array.from(new Set([pick(tagPool), pick(tagPool)])).slice(0, int(1, 2)),
    attempts,
    lastContactAt: lastContactAgo ? iso(lastContactAgo) : undefined,
    nextAction,
    createdAt: iso(createdAgo),
    timezone,
    city,
    state,
    customFields: {
      "Monthly bill": `$${int(9, 38) * 10}`,
      Homeowner: rand() > 0.15 ? "Yes" : "No",
      "Roof type": pick(roofTypes),
      Utility: pick(utilities),
      "Credit score band": pick(["650–699", "700–749", "750+", "Not provided"]),
    },
    crmSync: i % 41 === 3 ? "failed" : i % 17 === 0 ? "pending" : "synced",
    consent: stage === "dnc" ? "revoked" : rand() > 0.2 ? "granted" : "unknown",
    aiSummary: hasSummary ? { text: pick(summaries), confidence: 0.72 + rand() * 0.24, generatedAt: iso(int(1, 72) * HOUR), model: "llm-provider/default" } : undefined,
  };
});

// Put a few recognisable, high-signal leads at the front of the dialer queue.
const featured: Partial<Contact>[] = [
  { firstName: "Rachel", lastName: "Donovan", leadState: "fresh", stage: "new", attempts: 0, source: "Website form", city: "Denver", state: "CO", timezone: "America/Denver", phone: "+13035550101", email: "rachel.donovan@gmail.com", tags: ["high-bill", "homeowner"] },
  { firstName: "Victor", lastName: "Almeida", leadState: "warm", stage: "callback", attempts: 3, source: "Facebook Ads", city: "Aurora", state: "CO", timezone: "America/Denver", phone: "+17205550122", email: "valmeida@outlook.com", tags: ["financing"] },
  { firstName: "Tanya", lastName: "Brooks", leadState: "fresh", stage: "attempting", attempts: 1, source: "Google Ads", city: "Boulder", state: "CO", timezone: "America/Denver", phone: "+13035550133", email: "tanya.b@icloud.com", tags: ["ev-owner", "battery-interest"] },
  { firstName: "Greg", lastName: "Holloway", leadState: "aged", stage: "attempting", attempts: 5, source: "GHL import", city: "Las Vegas", state: "NV", phone: "+17025550144", email: undefined, tags: ["homeowner"], timezone: "America/Los_Angeles" },
  { firstName: "Denise", lastName: "Carter", leadState: "fresh", stage: "new", attempts: 0, source: "Website form", city: "Salt Lake City", state: "UT", timezone: "America/Denver", phone: "+18015550155", email: "denise.carter@yahoo.com", tags: ["solar-interest"] },
];
featured.forEach((f, i) => {
  const c = contacts[i]!;
  Object.assign(c, f, { createdAt: f.leadState === "fresh" ? iso((4 + i * 3) * MIN) : c.createdAt });
  c.campaignId = campaigns[f.leadState === "aged" ? 2 : 0]!.id;
  c.campaignName = campaigns[f.leadState === "aged" ? 2 : 0]!.name;
  c.ownerId = "usr_1";
  c.ownerName = users[0]!.name;
  c.crmSync = "synced";
  c.consent = "granted";
  c.lastContactAt = c.attempts === 0 ? undefined : iso((12 + i * 20) * MIN);
  if (f.stage === "callback") {
    c.nextAction = { type: "callback", label: "Callback due now", at: iso(2 * MIN) };
    c.aiSummary = { text: summaries[3]!, confidence: 0.88, generatedAt: iso(26 * HOUR), model: "llm-provider/default" };
  }
});

export const dialerLeadOrder = contacts.slice(0, 5).map((c) => c.id).concat(contacts.filter((c) => c.leadState === "fresh" || c.leadState === "warm").slice(5, 40).map((c) => c.id));

export const queueReasons: Record<string, string> = {
  con_0001: "Fresh web lead, created 4 min ago · 0 attempts · Speed-to-lead SLA 5 min",
  con_0002: "Callback due now (requested by contact) · Warm · 3 attempts",
  con_0003: "Fresh Google Ads lead · 1 attempt (no answer 12 min ago) · retry window open",
  con_0004: "Aged lead · 5 attempts · retry rule: no answer → 24h",
  con_0005: "Fresh web lead, created 16 min ago · 0 attempts",
};

export const complianceBlocks: Record<string, { code: "dnc" | "calling_window" | "consent"; message: string }> = {
  con_0004: { code: "calling_window", message: "It is 7:52 AM for this contact (America/Los_Angeles). Calling window opens at 9:00 AM." },
};

export function contactTimeline(c: Contact): TimelineEvent[] {
  const base = new Date(c.createdAt).getTime();
  const events: TimelineEvent[] = [
    { id: `${c.id}_t1`, kind: "lead_created", title: "Lead created", detail: `Source: ${c.source} · synced from GoHighLevel`, at: new Date(base).toISOString(), actor: "GHL webhook" },
    { id: `${c.id}_t2`, kind: "campaign_added", title: `Added to ${c.campaignName}`, detail: "Queue: matched lifecycle + source rule", at: new Date(base + 40_000).toISOString(), actor: "Queue engine" },
  ];
  const span = NOW - base;
  for (let a = 0; a < Math.min(c.attempts, 4); a++) {
    const t = base + (span * (a + 1)) / (Math.min(c.attempts, 4) + 1.5);
    const connected = a === Math.min(c.attempts, 4) - 1 && ["connected", "qualified", "callback", "appointment"].includes(c.stage);
    events.push({ id: `${c.id}_a${a}`, kind: connected ? "connected" : "no_answer", title: connected ? "Connected · 4m 12s" : `Call attempt ${a + 1} · No answer`, detail: connected ? "Discussed bill and roof; spouse to join consult" : undefined, at: new Date(t).toISOString(), actor: c.ownerName });
    if (!connected && a === 0) events.push({ id: `${c.id}_s${a}`, kind: "sms_sent", title: "SMS sent", detail: "Hi {{first}}, this is Summit Solar following up on your request…", at: new Date(t + 60_000).toISOString(), actor: "Workflow: No answer → SMS" });
  }
  if (c.stage === "callback") events.push({ id: `${c.id}_cb`, kind: "callback_scheduled", title: "Callback scheduled", detail: c.nextAction?.label, at: iso(26 * HOUR), actor: c.ownerName });
  if (c.stage === "qualified" || c.stage === "appointment") events.push({ id: `${c.id}_q`, kind: "qualified", title: "Qualified", detail: "Homeowner · bill > $150 · decision maker", at: iso(20 * HOUR), actor: c.ownerName });
  if (c.stage === "appointment") events.push({ id: `${c.id}_ap`, kind: "appointment", title: "Appointment booked", detail: "Solar consult · GHL calendar: Consults — Denver", at: iso(19 * HOUR), actor: c.ownerName });
  if (c.leadState === "aged" || c.leadState === "zombie") events.push({ id: `${c.id}_st`, kind: "state_changed", title: `Lifecycle → ${c.leadState === "aged" ? "Aged" : "Zombie"}`, detail: c.leadState === "aged" ? "No connection within 24h" : "No connection in 30 days", at: new Date(base + span * 0.6).toISOString(), actor: "Lifecycle engine" });
  return events.sort((a, b) => b.at.localeCompare(a.at));
}

export function contactCalls(c: Contact): Call[] {
  return contactTimeline(c)
    .filter((e) => e.kind === "no_answer" || e.kind === "connected")
    .map((e, i) => ({
      id: `call_${c.id}_${i}`,
      contactId: c.id,
      contactName: `${c.firstName} ${c.lastName}`,
      agentName: c.ownerName,
      campaignName: c.campaignName,
      direction: "outbound" as const,
      fromNumber: "+13035550142",
      toNumber: c.phone,
      state: "completed" as const,
      startedAt: e.at,
      durationSec: e.kind === "connected" ? 252 : 0,
      disposition: (e.kind === "connected" ? (c.stage === "appointment" ? "appointment" : c.stage === "callback" ? "callback" : "interested") : "no_answer") as DispositionCode,
    }));
}

// ── Conversations ────────────────────────────────────────────────────────
const inboundMsgs = [
  "Hi, yes I filled out the form. What's the next step?",
  "Can you call me after 5? I'm at work until then.",
  "How much does a typical system cost for a 2,000 sq ft house?",
  "Is the tax credit still available this year?",
  "Not interested anymore, we went with another company.",
  "Thursday morning works for the consult.",
  "Who is this?",
  "My husband wants to be on the call too. Can we do Saturday?",
  "Sorry I missed your call. Still interested!",
  "STOP",
];
const outboundMsgs = [
  "Hi {first}, this is {agent} with Summit Solar — thanks for your interest! Is now a good time for a quick 5-minute call?",
  "No problem, {first}. I'll give you a call after 5 today.",
  "Great question — most homes your size land between 7–9 kW. I can give you an exact estimate on a quick call.",
  "Yes, the 30% federal credit applies for systems installed this year. Happy to walk you through it.",
  "You're booked for Thursday at 10:00 AM. You'll get a confirmation text shortly.",
];

export const conversations: Conversation[] = [];
export const conversationEntries: Record<string, ConversationEntry[]> = {};

contacts.slice(0, 34).forEach((c, i) => {
  const id = `cnv_${i + 1}`;
  const agent = i % 3 === 0 ? undefined : users[(i % 7) + (i % 2 === 0 ? 0 : 1)]!;
  const numberUsed = phoneNumbers[i % 6]!.number;
  const start = NOW - int(20, 60 * 72) * MIN;
  const entries: ConversationEntry[] = [];
  let t = start;
  const turns = int(2, 7);
  for (let k = 0; k < turns; k++) {
    t += int(2, 90) * MIN;
    if (t > NOW) t = NOW - int(1, 15) * MIN;
    const kind = k === 0 ? "call" : k % 2 === 1 ? "out" : "in";
    if (kind === "call") {
      const connected = rand() > 0.55;
      entries.push({
        id: `${id}_e${k}`,
        conversationId: id,
        channel: "call",
        direction: "outbound",
        at: new Date(t).toISOString(),
        agentName: agent?.name ?? "Maya Chen",
        fromNumber: numberUsed,
        call: { durationSec: connected ? int(45, 540) : 0, disposition: connected ? pick<DispositionCode>(["interested", "callback"]) : "no_answer", state: "completed" },
      });
    } else if (kind === "out") {
      entries.push({
        id: `${id}_e${k}`,
        conversationId: id,
        channel: "sms",
        direction: "outbound",
        body: pick(outboundMsgs).replace("{first}", c.firstName).replace("{agent}", (agent?.name ?? "Maya Chen").split(" ")[0]!),
        status: i === 7 && k === turns - 1 ? "failed" : pick(["delivered", "delivered", "read", "sent"]),
        at: new Date(t).toISOString(),
        agentName: agent?.name ?? "Automation",
        fromNumber: numberUsed,
      });
    } else {
      entries.push({ id: `${id}_e${k}`, conversationId: id, channel: "sms", direction: "inbound", body: pick(inboundMsgs.slice(0, 9)), status: "received", at: new Date(t).toISOString(), fromNumber: c.phone });
    }
  }
  // ensure the most recent few conversations end with an inbound reply (unread)
  if (i < 9) {
    t = NOW - (i * 11 + 3) * MIN;
    entries.push({ id: `${id}_last`, conversationId: id, channel: "sms", direction: "inbound", body: inboundMsgs[i % 9]!, status: "received", at: new Date(t).toISOString(), fromNumber: c.phone });
  }
  entries.sort((a, b) => a.at.localeCompare(b.at));
  const last = entries[entries.length - 1]!;
  conversationEntries[id] = entries;
  conversations.push({
    id,
    contactId: c.id,
    contactName: `${c.firstName} ${c.lastName}`,
    contactPhone: c.phone,
    assigneeId: agent?.id,
    assigneeName: agent?.name,
    unreadCount: i < 9 && last.direction === "inbound" ? (i % 3) + 1 : 0,
    lastMessagePreview: last.channel === "call" ? (last.call?.durationSec ? `Call · ${Math.round(last.call.durationSec / 60)}m` : "Missed call") : last.body!,
    lastMessageAt: last.at,
    lastChannel: last.channel,
    numberUsed,
    leadState: c.leadState,
    campaignName: c.campaignName,
  });
});
conversations.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

// ── Agents ───────────────────────────────────────────────────────────────
const agentStatuses: AgentStatus[] = ["on_call", "available", "on_call", "wrap_up", "on_call", "break", "available", "offline"];
export const agentActivity: AgentActivity[] = users.map((u, i) => {
  const status = agentStatuses[i]!;
  const calls = status === "offline" ? 0 : int(38, 142);
  const connects = Math.round(calls * (0.22 + rand() * 0.14));
  return {
    userId: u.id,
    name: u.name,
    initials: u.initials,
    status,
    statusSince: iso(int(1, 38) * MIN),
    campaignName: status === "offline" ? undefined : pick(campaigns.slice(0, 4)).name,
    currentContact: status === "on_call" ? `${pick(firstNames)} ${pick(lastNames)}` : undefined,
    callsToday: calls,
    connectsToday: connects,
    appointmentsToday: Math.round(connects * (0.08 + rand() * 0.1)),
    talkTimeSec: connects * int(140, 260),
  };
});

// ── Appointments ─────────────────────────────────────────────────────────
export const appointments: Appointment[] = contacts
  .filter((c) => c.stage === "appointment")
  .slice(0, 14)
  .map((c, i) => ({
    id: `apt_${i + 1}`,
    contactId: c.id,
    contactName: `${c.firstName} ${c.lastName}`,
    agentName: c.ownerName ?? "Maya Chen",
    campaignName: c.campaignName ?? "Solar Inbound — Web Leads",
    calendarName: i % 2 ? "Consults — Denver" : "Consults — Phoenix",
    startsAt: isoAhead((i - 3) * 7 * HOUR + 2 * HOUR),
    status: i < 3 ? "completed" : i === 5 ? "pending" : i === 9 ? "no_show" : "confirmed",
  }));

// ── Integrations ─────────────────────────────────────────────────────────
export const integrations: Integration[] = [
  {
    provider: "ghl",
    name: "GoHighLevel",
    category: "CRM",
    description: "System of record for contacts, custom fields, calendars and pipelines.",
    status: "needs_attention",
    connectedAccount: "Summit Solar · loc_8f2k1",
    lastSyncAt: iso(2 * MIN),
    required: true,
    checks: [
      { label: "OAuth token", status: "ok", detail: "Valid · refreshes automatically" },
      { label: "Location", status: "ok", detail: "Summit Solar (loc_8f2k1)" },
      { label: "Webhook delivery", status: "ok", detail: "99.8% delivered · last event 38s ago" },
      { label: "Contact sync", status: "warning", detail: "3 contacts failed to sync in the last 24h (custom field type mismatch)" },
    ],
    metrics: [
      { label: "Contacts synced", value: "18,442" },
      { label: "Events (24h)", value: "2,316" },
      { label: "Sync errors (24h)", value: "3" },
    ],
  },
  {
    provider: "twilio",
    name: "Twilio",
    category: "Telephony",
    description: "Voice, SMS, phone numbers, A2P 10DLC and STIR/SHAKEN attestation.",
    status: "connected",
    connectedAccount: "AC••••••••4f21",
    lastSyncAt: iso(1 * MIN),
    required: true,
    checks: [
      { label: "Account", status: "ok", detail: "Connected · primary sub-account" },
      { label: "Voice", status: "ok", detail: "WebRTC token service healthy" },
      { label: "SMS", status: "ok", detail: "Messaging service configured" },
      { label: "A2P 10DLC", status: "warning", detail: "Brand approved · 1 campaign registration pending" },
      { label: "STIR/SHAKEN", status: "ok", detail: "Business profile approved · A attestation on 10 of 12 numbers" },
      { label: "Status webhooks", status: "ok", detail: "p95 latency 180ms" },
    ],
    metrics: [
      { label: "Numbers", value: "12" },
      { label: "Calls (24h)", value: "1,284" },
      { label: "SMS (24h)", value: "412" },
    ],
  },
  {
    provider: "llm",
    name: "AI provider",
    category: "AI",
    description: "Call summaries, intent detection and QA scoring. Provider-agnostic; structured output only.",
    status: "not_connected",
    required: false,
    checks: [{ label: "Provider", status: "unknown", detail: "Not configured — AI features stay off; calling is unaffected" }],
  },
  {
    provider: "stt",
    name: "Speech-to-text",
    category: "AI",
    description: "Transcribes recordings and (later) live calls for QA and summaries.",
    status: "not_connected",
    required: false,
    checks: [{ label: "Provider", status: "unknown", detail: "Not configured" }],
  },
  {
    provider: "storage",
    name: "Object storage",
    category: "Infrastructure",
    description: "Encrypted storage for call recordings and exports (S3).",
    status: "connected",
    connectedAccount: "s3://dialbrio-recordings-us-west-2",
    lastSyncAt: iso(4 * MIN),
    required: true,
    checks: [
      { label: "Bucket access", status: "ok", detail: "Read/write verified" },
      { label: "Encryption", status: "ok", detail: "SSE-KMS enabled" },
      { label: "Retention", status: "ok", detail: "Recordings kept 365 days" },
    ],
  },
  {
    provider: "stripe",
    name: "Stripe",
    category: "Billing",
    description: "Subscription billing and usage-based charges.",
    status: "connected",
    connectedAccount: "acct_••••7Qm2",
    required: true,
    checks: [
      { label: "Subscription", status: "ok", detail: "Growth plan · renews Oct 14" },
      { label: "Usage reporting", status: "ok", detail: "Reported hourly" },
    ],
  },
  {
    provider: "sentry",
    name: "Sentry",
    category: "Monitoring",
    description: "Error monitoring for web, API and workers.",
    status: "error",
    required: false,
    checks: [{ label: "DSN", status: "error", detail: "Authentication failed — the DSN was rotated. Update it to resume error reporting." }],
  },
];

// ── Playbook ─────────────────────────────────────────────────────────────
export const playbook: Playbook = {
  id: "pb_1",
  name: "Solar consult — inbound",
  sections: [
    { id: "s1", title: "Opener", body: "Hi {first}, this is {agent} with Summit Solar. You requested info about solar for your home in {city} — did I catch you at an okay time for two minutes?" },
    { id: "s2", title: "Qualify", body: "Great. Quick questions so I don't waste your time:\n• Do you own the home?\n• Roughly what's your average monthly electric bill?\n• Is anyone else involved in decisions like this?" },
    { id: "s3", title: "Value", body: "Based on a ${bill} bill, most homeowners in {city} cover 80–100% of it with a system that pays for itself in 7–9 years, and the 30% federal credit applies this year." },
    { id: "s4", title: "Book", body: "The next step is a free 30-minute consult where we design your system from satellite imagery. I have Thursday at 10:00 AM or Saturday at 11:00 AM — which works better?" },
    { id: "s5", title: "Close", body: "Perfect, you're booked for {slot}. You'll get a text confirmation from this number. Anything else I can answer before then?" },
  ],
  objections: [
    { objection: "It's too expensive", response: "Totally fair. Most of our customers pay $0 upfront and a monthly payment lower than their current bill. The consult shows your exact numbers — no obligation." },
    { objection: "I need to talk to my spouse", response: "Of course — that's exactly why we book the consult when you're both available. Would an evening or weekend work better for both of you?" },
    { objection: "I'm getting other quotes", response: "Smart. We'll give you a written proposal you can compare side by side, including warranty terms, which is where quotes usually differ most." },
    { objection: "My roof is old", response: "Good catch. We assess roof condition during the consult, and if it needs work we can bundle it into the same financing." },
  ],
};

// ── Live-call transcript script (mock telephony) ─────────────────────────
export const transcriptScript: Omit<TranscriptSegment, "id">[] = [
  { speaker: "agent", text: "Hi, this is Maya with Summit Solar. You requested information about solar for your home — is now an okay time?", atSec: 2 },
  { speaker: "contact", text: "Yeah, I've got a few minutes. I filled that out last night.", atSec: 9 },
  { speaker: "agent", text: "Perfect. Do you own the home, and roughly what's your electric bill each month?", atSec: 14 },
  { speaker: "contact", text: "We own it. The bill's been around two-twenty since we got the EV.", atSec: 21 },
  { speaker: "agent", text: "That's a common story. With a bill like that most homeowners cover nearly all of it. Is anyone else involved in the decision?", atSec: 28 },
  { speaker: "contact", text: "My wife, yes. She'd want to be on any meeting.", atSec: 37 },
  { speaker: "agent", text: "Makes sense. Would Thursday at 10 or Saturday at 11 work for a free design consult with both of you?", atSec: 43 },
  { speaker: "contact", text: "Saturday at 11 should work.", atSec: 51 },
];

// ── Analytics helpers ────────────────────────────────────────────────────
export const hourlyActivity = ["8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p"].map((hour, i) => {
  const shape = [0.35, 0.8, 1, 0.92, 0.55, 0.7, 0.95, 0.88, 0.8, 0.72, 0.5, 0.3][i]!;
  const calls = Math.round(150 * shape + int(-8, 8));
  const future = i > 7; // later hours haven't happened yet today
  return { hour, calls: future ? 0 : calls, connected: future ? 0 : Math.round(calls * (0.26 + rand() * 0.1)) };
});

export const queueItemsFor = (q: DialQueue): QueueItem[] => {
  const pool = contacts.filter((c) => q.leadStates.includes(c.leadState) && c.stage !== "dnc" && c.stage !== "lost");
  return pool.slice(0, Math.min(q.waiting, 40)).map((c, i) => ({
    id: `${q.id}_${c.id}`,
    queueId: q.id,
    contactId: c.id,
    contactName: `${c.firstName} ${c.lastName}`,
    phone: c.phone,
    leadState: c.leadState,
    attempts: c.attempts,
    enqueuedAt: iso((i + 1) * int(1, Math.max(2, q.oldestWaitMinutes / 8 || 2)) * MIN),
    eligibleAt: i < 4 ? iso(0) : isoAhead(i * 3 * MIN),
    reason:
      queueReasons[c.id] ??
      (q.id === "q_1"
        ? `Callback requested for ${["2:30 PM", "3:00 PM", "3:15 PM", "4:00 PM"][i % 4]} · ${c.attempts} attempts`
        : c.leadState === "fresh"
          ? `Fresh ${c.source} lead · ${c.attempts} attempts · SLA 5 min`
          : c.leadState === "warm"
            ? `Warm — last connected ${int(1, 9)}d ago · follow-up rule`
            : c.leadState === "aged"
              ? `Aged ${int(3, 28)}d · ${c.attempts}/${q.maxAttempts} attempts · retry window open`
              : `Zombie · last attempt ${int(30, 120)}d ago · reactivation rule`),
    reservedBy: i === 0 && q.enabled ? "Jordan Ellis" : undefined,
  }));
};
