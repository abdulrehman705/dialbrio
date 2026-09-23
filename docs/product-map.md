# DialBrio Product Map

> What DialBrio is, who uses it, which screens exist, what each one is for, and who can see it.
> Companion documents: `docs/design.md` (visual system), `docs/architecture.md` (system design).

## 1. Positioning

DialBrio is a sales engagement and intelligent dialing platform that turns leads into conversations,
appointments and opportunities.

**System-of-record split**

| GoHighLevel (CRM) owns | DialBrio owns |
| --- | --- |
| Contact master record, CRM custom fields, pipelines | Campaigns, dial queues, lead lifecycle (Fresh/Warm/Aged/Zombie) |
| Calendars and availability | Calls, attempts, retries, callbacks, dispositions |
| Tags (mirrored, not authoritative for lifecycle) | Conversations and SMS operational state |
| Opportunities | Agent activity, QA, transcripts, AI assistance |
| | Phone numbers, number health, compliance |
| | Reporting and operational workflow state |

DialBrio is **not** a CRM, a chatbot, an AI voice demo or a Twilio console.

## 2. The core loop

```
Lead enters CRM ─► DialBrio ingests (webhook / sync) ─► validate + normalize
      ─► campaign + queue assignment ─► prioritize
      ─► dial (human or AI strategy) ─► conversation
      ─► disposition / intent ─► next action (retry | callback | SMS | appointment | DNC | lost)
      ─► sync outcome to CRM ─► analytics / QA
```

The agent-facing loop every UX decision optimises:

```
SELECT RIGHT LEAD → DIAL → TALK → CAPTURE OUTCOME → TAKE NEXT ACTION → NEXT LEAD
```

Target: one disposition keystroke + one confirmation to move to the next lead. Zero page navigation.

## 3. Personas

| Persona | Role | Goal | Lives in |
| --- | --- | --- | --- |
| Sales agent / setter | `agent` | Make 150–300 dials a day, book appointments | Dialer, Conversations |
| Sales manager / team lead | `manager` | Keep queues fresh, agents productive, campaigns converting | Overview, Queue, Campaigns, Analytics |
| Agency owner / admin | `admin` | Run multiple client sub-accounts safely, compliant and profitably | Overview, Integrations, Numbers, Compliance, Billing |

## 4. Tenancy model

```
Organization (agency / company, billing owner)
  └─ Sub-account (client / location; maps 1:1 to a GHL location)
       └─ Team
            └─ Users (via memberships with a role)
```

The org/sub-account switcher sits at the top of the sidebar. All data views are scoped to the
active sub-account; organization-level views (cross-account analytics, billing) are labelled as such.

## 5. Roles and permissions

Inaccessible navigation is **hidden**. Authorization is enforced by the API; the UI only mirrors it.

| Module | Admin | Manager | Agent |
| --- | --- | --- | --- |
| Overview | Org + sub-account | Sub-account / team | Personal |
| Dialer | Yes | Yes | Yes |
| Queue manager | Yes | Yes | — |
| Campaigns | Full | Full (own sub-account) | View assigned (read-only list) |
| Conversations | All | Team | Mine + unassigned |
| Contacts | All | Sub-account | Within assigned campaigns |
| Calendar | All | Team | Mine |
| Analytics | All | Team + agents | Personal metrics only |
| AI QA | Yes | Yes | Own calls (read-only) |
| Phone numbers | Full | View | — |
| Workflows | Full | Full | — |
| Compliance | Full | View | — |
| Team | Full | Manage own teams | — |
| Integrations | Full | — | — |
| Billing | Full | — | — |
| Settings | All sections | Dialer, Notifications, Personal | Personal, Notifications |

The permission map lives in `packages/types/src/permissions.ts` and is shared by web and API.

## 6. Navigation

```
PRIMARY        Overview · Dialer · Queue · Campaigns · Conversations · Contacts · Calendar
INTELLIGENCE   Analytics · AI QA
OPERATIONS     Phone Numbers · Workflows · Compliance
ADMIN          Team · Integrations · Billing · Settings
```

Routes (authenticated app lives under `/app`, marketing at `/`):

| Route | Screen | Phase delivered |
| --- | --- | --- |
| `/app` | Overview dashboard | UI: pass 1 · data: Phase 4 |
| `/app/dialer` | Dialer workspace | UI: pass 1 · data: Phase 2–3 |
| `/app/queue` | Queue manager | UI: pass 1 · data: Phase 2 |
| `/app/campaigns` | Campaign list | UI: pass 1 · data: Phase 2 |
| `/app/campaigns/new` | Campaign wizard (9 steps) | UI: pass 1 · data: Phase 2 |
| `/app/conversations` | Inbox | UI: pass 1 · data: Phase 3 |
| `/app/contacts` | Contacts + detail drawer | UI: pass 1 · data: Phase 1 |
| `/app/calendar` | Appointments (GHL-backed) | Phase 4 |
| `/app/analytics` | Reporting | UI: pass 1 · data: Phase 4 |
| `/app/ai-qa` | AI QA | Phase 5 |
| `/app/numbers` | Phone numbers | Phase 3 |
| `/app/workflows` | Follow-up sequences | Phase 2 (deterministic) |
| `/app/compliance` | Compliance centre | Phase 3 |
| `/app/team` | Team & roles | Phase 1 |
| `/app/integrations` | Integration centre | UI: pass 1 · data: Phase 1/3 |
| `/app/billing` | Billing & usage (plan, metered usage, sub-account rebilling) | UI: pass 2 · data: Phase 7 |
| `/app/settings/[section]` | Settings foundation | UI: pass 1 |

Screens not in pass 1 render an honest "planned" state describing what will live there and when —
never fake functionality.

## 7. Screen inventory

Every screen answers: *Where am I? What is happening? What needs attention? What is the primary action?
What happens after?*

### Overview (dashboard)
- **Question:** Is the operation healthy right now?
- **KPIs:** Calls today, Connect rate, Appointments, Speed to lead, Active agents, Queue waiting.
- **Panels:** Live agent activity, Call activity (by hour), Queue health, Lead lifecycle, Conversion
  funnel, Number health, Recent conversations, Needs attention.
- **Primary action:** Manager → resolve Needs-attention items; Agent → "Start dialing".

### Dialer
- **Question:** Who am I calling, what do I say, what happened?
- **Regions:** Session header (campaign, caller ID, queue depth, calls, connected, session timer) ·
  Lead panel (identity, lifecycle, attempts, last conversation, custom fields, tags; tabs: Script,
  Notes, History) · Call panel (state, controls, disposition picker, callback/appointment inline forms) ·
  Footer (session stats, next lead preview, CRM sync state).
- **Call states:** Idle → Preparing → Dialing → Ringing → Connected → Wrapping up → Completed | Failed.
- **Primary action:** Call / End / Save & next (context-dependent single primary button).
- **After:** disposition saved → next action scheduled (retry/callback/SMS) → CRM sync queued →
  next eligible lead is already loaded.

### Queue manager (manager+)
- **Question:** Are the right leads waiting, and are they being reached fast enough?
- **Metrics:** Waiting, Active calls, Available agents, Oldest lead, Average wait, Throughput/hr.
- **Queues:** ordered list (drag to reorder priority), enable/disable, lifecycle filter, source, retry
  rules, max attempts, calling window.
- **Lead explainability:** each queue item shows *why it is here* (rule matched, state, attempts, next
  eligible time).

### Campaigns
- **List:** Name, Status, Queue, Leads, Attempts, Connected, Appointments, Conversion, Agents, Caller IDs.
- **Wizard:** Basics → Lead source → Queue & priority → Calling rules → Dispositions → Follow-up →
  Numbers → Agents → Review & launch. Drafts save per step.

### Contacts
- **Table:** Name, Phone, Email, Source, Lifecycle, Campaign, Owner, Last contact, Attempts, Next action.
- **Detail drawer:** Profile, Timeline, Calls, Messages, Appointments, CRM fields, Tags, Notes, AI summary.

### Conversations
- **Layout:** list · thread · contact context.
- **Filters:** Unread, Assigned, Unassigned, Mine, Team, search.
- **Messages show:** responding agent, delivery state, timestamp, number used. Calls appear inline.

### Analytics
- **Scopes:** organization, sub-account, team, agent, campaign, number, date range.
- **KPIs:** Calls, Connected, Connect rate, Talk time, Avg call duration, Appointments, Appointment rate,
  Speed to lead, Retries, No answers, DNC, Agent idle time.

### Integrations
- **Cards:** GoHighLevel, Twilio, AI provider, Speech-to-text, Object storage, Stripe, Sentry.
- **States:** Connected, Not connected, Needs attention, Error.
- **GHL detail:** OAuth, location, webhook health, last sync, contacts synced, sync errors.
- **Twilio detail:** account, numbers, voice, SMS, A2P, STIR/SHAKEN, webhook health.

### Settings
General · Organization · Team & roles · Dialer · Numbers · Compliance · CRM · AI · Notifications ·
Billing · Developer. One section per page; section list on the left.

## 8. Lead lifecycle (first-class state, not tags)

| State | Definition (default rules, configurable per sub-account) | Typical treatment |
| --- | --- | --- |
| **Fresh** | Created < 24h ago and < 3 attempts | Highest priority, speed-to-lead SLA |
| **Warm** | Had a connected conversation or reply in the last 14 days, not closed | Callback/follow-up priority |
| **Aged** | 1–30 days old, no connection, attempts remaining | Normal cadence |
| **Zombie** | > 30 days without connection, or max attempts exhausted | Low-frequency revival campaigns |

Terminal outcomes are tracked separately as **stage**: `appointment`, `lost`, `dnc`. Lifecycle
transitions are recorded in `lead_state_history` with a reason.

## 9. Dispositions

| Code | Label | Shortcut | Default next action |
| --- | --- | --- | --- |
| `interested` | Interested | 1 | Warm, follow-up task in 1 day |
| `appointment` | Appointment | 2 | Book via CRM calendar, stop sequence |
| `callback` | Callback | 3 | Schedule callback at chosen time |
| `no_answer` | No answer | 4 | Retry per campaign rule |
| `busy` | Busy | 5 | Retry in 15 min |
| `voicemail` | Voicemail | 6 | Retry + optional SMS |
| `not_interested` | Not interested | 7 | Lost |
| `wrong_number` | Wrong number | 8 | Flag number invalid, lost |
| `dnc` | Do not call | 9 | Add to DNC (deterministic, irreversible without admin) |

## 10. UX state checklist (per feature)

Loading · Skeleton · Empty · Success · Error · Permission denied · Disconnected integration ·
Offline/reconnecting (live surfaces only). Shared components: `Skeleton`, `EmptyState`, `ErrorState`,
`PermissionState`, `IntegrationRequired`, `ConnectionBanner`.

## 11. MVP boundary

**In MVP:** GHL integration, contacts, campaigns, queue, Fresh/Warm/Aged/Zombie, dialer, Twilio,
dispositions, callbacks, retry, SMS/conversations, calendar booking, basic reporting, team roles,
compliance foundations.

**Not blocking MVP:** autonomous AI voice, visual workflow builder, white-labelling, social channels,
native CRM/calendar, reseller billing, additional CRMs.

## 12. Delivery phases

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 0 Design foundation | Brand, docs, tokens, shell, primitives, themes, responsive | Coherent reusable system |
| 1 Platform foundation | Auth, orgs, users, roles, GHL OAuth + webhooks, contact sync, audit | A GHL lead appears once; updates idempotent |
| 2 Core dialer | Campaigns, lifecycle, queues, reservation, dialer, dispositions, callbacks, retries | Agent completes a calling session |
| 3 Telephony | Twilio, numbers, calls, recordings, SMS, conversations, number health, A2P/STIR | Production calls + messages reliable |
| 4 CRM + booking + reporting | Outcome sync, notes, fields, tags, calendar, reporting, speed-to-lead | Lead → call → appointment → CRM complete |
| 5 AI assistance | Transcription, summary, intent, QA, coaching | AI can fail without breaking calling |
| 6 AI voice | AI dial strategy, STT/TTS, voice agent, tools, handoff | Campaign switches Human/AI with no core changes |
| 7 Scale | Advanced RBAC, billing, usage limits, onboarding, more CRMs | |

**This pass (first implementation deliverable):** docs, brand, shell, landing page, and UI for
Overview, Dialer, Queue, Contacts, Campaigns, Conversations, Analytics, Integrations, Settings —
driven by a seeded mock repository behind the same interface the real API will implement.

## 13. Positioning, customers and plans

Source: the product documents supplied in Sept 2026 (Features, Pricing, Business Model — written under the
working name "Dial Pounce"; the product ships as DialBrio).

**Positioning.** For sales teams and agencies that live in GoHighLevel or HubSpot, DialBrio is the power dialer
that includes everything (parallel dialing, coaching intelligence, white-label) at one honest price you can
start using today without a sales call. Wedge: self-serve free trial + sub-2¢ minutes + white-label agency
tooling in one product.

**Customers.**
- Primary: marketing agencies on GHL/HubSpot running lead-gen for local businesses (med spas, dental, home
  services, real estate, legal). Deploy across 5–50 clients, rebill minutes at a markup.
- Secondary: in-house SDR teams of 2–15, arriving via comparison SEO and the trial, expanding seat by seat.

**Jobs to be done.** Reach more leads per rep-hour · get to inbound leads before competitors · prove calls turn
into booked revenue · stay TCPA-safe without thinking about it · (agencies) resell it under their own brand.

### Plans (price book: `packages/types/src/pricing.ts`)

| Plan | Price | Seats | Adds |
| --- | --- | --- | --- |
| Solo | $97/mo | 1 | Power + 4-line parallel, local presence, AI transcription & scoring, GHL/HubSpot sync |
| Team (most popular) | $247/mo | 5 | Speed-to-lead auto-dial (<10s), AI coaching & objections, voicemail drop, SMS/email sequences, leaderboards, live monitor |
| Agency | $447/mo | 10 | Unlimited sub-accounts, white-label portal, client reporting & margin billing, AI voice + SMS agents (1,000 AI min), 48-hr migration |
| Enterprise | Custom | 25+ | Volume pricing, SSO, audit logs, custom retention, SLA 99.99%, DPA |

Annual −20%. Trial: 14 days, 500 free minutes, no card. Usage (same on every plan, billed monthly in arrears):
outbound 1.5¢/min · inbound 1¢/min · SMS 1.2¢/segment · local number $2/mo · extra seat $59/mo (5-pack $225) ·
AI voice-agent minutes 9¢ after included. Compliance tooling is never an upsell.

### Feature additions from the product documents → phases

| Feature | Where it shows up | Phase |
| --- | --- | --- |
| Parallel dialing (1–4 lines) with answer-machine detection | Dialer session header, campaign dial mode | UI now · telephony Phase 3 |
| Speed-to-lead trigger (dial < 10s after lead creation) | Campaign lead source, Fresh queue SLA | Phase 2 |
| Voicemail drop (pre-recorded, one click) | Dialer call controls (`V`), settings recordings | UI now · Phase 3 |
| Local presence + spam remediation | Caller ID selection, number health | Phase 3 |
| Whisper / barge / listen | Overview live agents (manager) | Phase 3 |
| Email channel | Conversations composer | Phase 4 |
| AI scoring 0–100, objections, coaching | AI QA | Phase 5 |
| AI voice + SMS agents | Campaign dial strategy "AI" | Phase 6 |
| White-label portal, client billing & margins | Settings → Organization, Billing | Phase 7 |

### Business KPIs to instrument

Trial → paid ≥ 12% · week-1 dials ≥ 100 per activated account · NRR ≥ 115% · agency logo churn < 2%/mo ·
blended gross margin ≥ 70%. Activation milestone: first 100 dials in week one.
