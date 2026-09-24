# DialBrio Architecture

> System design for DialBrio: repository layout, backend modules, data model, API and event
> contracts, integration boundaries, and the frontend data layer.
> Companion documents: `docs/product-map.md`, `docs/design.md`.

## 1. Principles

1. **Modular monolith + workers.** One NestJS API, one worker process (Temporal workers + queue
   consumers). No microservices until a module has a proven independent scaling need.
2. **Adapters at every external boundary.** GHL, Twilio, LLM, STT and voice vendors sit behind
   interfaces in `packages/integrations`. Core business logic never imports a vendor SDK.
3. **Webhooks are persisted, acknowledged, then processed.** Never run business workflows inside
   the HTTP request of a webhook.
4. **Idempotency everywhere external events enter.** Duplicates must be no-ops.
5. **Tenant isolation on the backend.** Every tenant-owned row carries `organization_id`; every
   query is scoped by a request-bound tenant context. The frontend never filters for security.
6. **Deterministic compliance.** DNC, calling windows, consent and registration checks are pure,
   rule-based and audited. AI can suggest; it cannot override compliance.
7. **Structured AI.** AI returns validated structured data with confidence; only deterministic
   code applies state changes.

## 2. Repository layout

```
dialbrio/
├─ apps/
│  ├─ web/            Next.js App Router — marketing site + authenticated app (this pass)
│  │                  (studio/ at the repo root holds the standalone Sanity Studio — see §15)
│  ├─ api/            NestJS modular monolith (Phase 1+) — prisma/schema.prisma defines the model
│  └─ worker/         Temporal workers + webhook processors (Phase 1+)
├─ packages/
│  ├─ types/          Domain types, enums, API/event contracts, permission map (shared)
│  ├─ integrations/   Adapter interfaces: CRMAdapter, TelephonyProvider, AI providers, DialStrategy
│  ├─ validation/     Zod schemas shared by web forms and API DTOs (Phase 1)
│  ├─ ui/             Extracted design-system package once a second app consumes it
│  ├─ config/         Shared runtime config loading (Phase 1)
│  └─ tsconfig/       Base TypeScript config
├─ infra/             Terraform / CDK for AWS (Phase 1+)
└─ docs/
```

Design-system components currently live in `apps/web/src/components` and move to `packages/ui`
when the first second consumer appears (avoids premature package boundaries).

## 3. Runtime topology (AWS)

```
                ┌────────────┐     ┌──────────────────────────┐
 Browser ──────►│ CloudFront │────►│ web (Next.js, ECS/Fargate)│
                └────────────┘     └────────────┬─────────────┘
                                                │ REST + SSE (same-site cookie)
 GHL / Twilio / Stripe webhooks ───────────────►│
                                   ┌────────────▼─────────────┐
                                   │ api (NestJS, ECS)         │──► PostgreSQL (RDS)
                                   │  - REST controllers       │──► Redis (ElastiCache):
                                   │  - webhook intake         │     cache, rate limit,
                                   │  - SSE gateway            │     pub/sub, lead locks
                                   └────────────┬─────────────┘
                                                │ start/signal workflows
                                   ┌────────────▼─────────────┐
                                   │ Temporal (Cloud or self)  │
                                   └────────────┬─────────────┘
                                   ┌────────────▼─────────────┐
                                   │ worker (ECS)              │──► S3 (recordings, exports)
                                   │  - webhook processors     │──► Twilio / GHL / AI APIs
                                   │  - workflow activities    │
                                   └──────────────────────────┘
 Observability: Sentry (web, api, worker) · OpenTelemetry → collector → tracing backend · structured JSON logs
```

## 4. Backend modules (NestJS)

| Module | Responsibility |
| --- | --- |
| `auth` | Sessions (HTTP-only secure cookie), SSO later, CSRF tokens |
| `organizations`, `subaccounts`, `users`, `teams` | Tenancy, memberships, roles |
| `contacts` | Normalized contacts, external IDs, dedupe (E.164 + email + CRM id) |
| `campaigns` | Campaign config, dial strategy selection, assignment |
| `queues` | Queue definitions, rules, ordering, lead reservation (Redis lock + DB row lock) |
| `lifecycle` | Fresh/Warm/Aged/Zombie evaluation + history |
| `dialer` | Agent sessions, next-lead selection, call orchestration via `DialStrategy` |
| `calls` | Calls, attempts, call events, recordings |
| `dispositions`, `callbacks` | Outcome capture, scheduled callbacks |
| `conversations`, `messages` | SMS threads, delivery states |
| `phone-numbers` | Inventory, assignment, health checks, cooldown |
| `compliance` | DNC, calling windows, consent, A2P/STIR status; `ComplianceGate` |
| `appointments` | Booking via CRM calendar |
| `workflows` | Follow-up sequence definitions; execution delegated to Temporal |
| `integrations` (`ghl`, `twilio`) | OAuth, credentials (KMS-encrypted), webhook intake, adapters |
| `analytics` | Aggregations, rollup tables, report queries |
| `ai` | Transcription, summaries, intent, QA via provider interfaces |
| `billing` | Stripe subscriptions, usage events, limits |
| `audit` | Append-only audit log for security-relevant and compliance actions |

Cross-cutting: `TenantContext` (AsyncLocalStorage: `organizationId`, `subAccountId`, `userId`,
`role`, `requestId`), `RolesGuard` using the shared permission map, `IdempotencyInterceptor`,
Zod validation pipe, rate limiter (Redis), OpenTelemetry instrumentation.

## 5. Data model

The canonical schema is `apps/api/prisma/schema.prisma`. Summary:

```
organizations ─┬─ sub_accounts ─┬─ teams ── team_members ── users
               │                ├─ crm_connections, phone_numbers, number_health_checks
               │                ├─ contacts ─ contact_external_ids
               │                │     └─ lead_states (1:1 current) ─ lead_state_history
               │                ├─ campaigns ─ campaign_contacts
               │                │     └─ dial_queues ─ dial_queue_items
               │                ├─ call_attempts ─ calls ─ call_events, call_recordings, transcripts, ai_call_reviews
               │                ├─ dispositions, callbacks, appointments
               │                ├─ conversations ─ messages
               │                ├─ workflow_definitions ─ workflow_runs
               │                └─ compliance_registrations, dnc_entries
               ├─ memberships (user × org × sub-account × role)
               ├─ webhook_events, usage_events, subscriptions, audit_logs
```

Rules:
- Every tenant-owned table: `id` (UUIDv7), `organization_id`, `created_at`, `updated_at`; most also
  `sub_account_id`. Composite indexes lead with `organization_id`.
- PostgreSQL Row-Level Security is enabled as a **second** line of defence (`app.organization_id`
  set per transaction); primary enforcement is the tenant-scoped repository layer.
- Soft-delete only where history matters (contacts, campaigns); `dnc_entries` are never deleted.
- Money in integer cents; durations in integer seconds; timestamps `timestamptz`.
- Lifecycle is a column + history table, never a tag.

## 6. API contracts (REST, `/v1`)

Conventions: JSON, camelCase, cursor pagination `?cursor=&limit=` for feeds, page pagination
`?page=&pageSize=` for tables, `Idempotency-Key` header on mutating POSTs, errors as
`{ error: { code, message, details?, requestId } }`. Tenant is taken from the session plus
`X-Sub-Account-Id` (validated against memberships).

Representative endpoints (types in `packages/types/src/api.ts`):

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/me` | Current user, memberships, permissions |
| GET | `/v1/dashboard/overview?range=today` | KPIs + panels |
| GET | `/v1/contacts?page&pageSize&q&lifecycle&campaignId&ownerId` | Contact table |
| GET | `/v1/contacts/:id` / `/timeline` | Detail + activity |
| GET/POST/PATCH | `/v1/campaigns`, `/v1/campaigns/:id` | Campaign CRUD (wizard saves drafts via PATCH) |
| POST | `/v1/campaigns/:id/launch` | Validate + activate |
| GET/PATCH | `/v1/queues`, `/v1/queues/:id` | Queue config |
| PUT | `/v1/queues/order` | Priority ordering |
| GET | `/v1/queues/:id/items` | Items with `reason` |
| POST | `/v1/dialer/sessions` | Start agent session `{ campaignId, callerIdStrategy }` |
| POST | `/v1/dialer/sessions/:id/next` | Reserve next eligible lead (returns lead + reservation TTL) |
| POST | `/v1/dialer/sessions/:id/calls` | Start call for reserved lead (runs `ComplianceGate`) |
| POST | `/v1/calls/:id/end`, `/mute`, `/hold`, `/transfer` | Call control |
| POST | `/v1/calls/:id/disposition` | `{ code, notes?, callbackAt?, appointment? }` → next action |
| GET | `/v1/conversations?filter=unread|mine|unassigned|team` | Inbox |
| POST | `/v1/conversations/:id/messages` | Send SMS |
| GET | `/v1/analytics/report?scope&range&groupBy` | Reporting |
| GET | `/v1/integrations` / `/:provider` | Integration health |
| GET | `/v1/stream` | SSE: call, agent, queue, message, sync events for the current tenant |
| POST | `/webhooks/ghl`, `/webhooks/twilio/voice`, `/webhooks/twilio/sms`, `/webhooks/stripe` | Intake |

## 7. Event contracts

### 7.1 Webhook intake pipeline

```
POST /webhooks/{provider}
  1. verify signature (GHL public key / Twilio X-Twilio-Signature / Stripe signing secret)
  2. derive event_id (provider id, or sha256(payload) when provider has none)
  3. INSERT INTO webhook_events (provider, event_id, event_type, payload, payload_hash, status='received')
     ON CONFLICT (provider, event_id) DO NOTHING
  4. respond 200 immediately (duplicates also get 200)
  5. enqueue processing (Temporal workflow id = `webhook:{provider}:{event_id}` → dedupes)
worker:
  6. normalize → domain command (e.g. UpsertContactFromCrm)
  7. apply with optimistic concurrency (external `updated_at`/version guard; stale events ignored)
  8. mark processed_at / status = processed | ignored_duplicate | ignored_stale | failed (+ error)
```

### 7.2 Idempotency guarantees

| Risk | Guard |
| --- | --- |
| Duplicate lead | Unique `(sub_account_id, provider, external_id)` on `contact_external_ids`; upsert |
| Duplicate call | Unique `provider_call_sid` on `calls`; `call_attempts.idempotency_key` |
| Duplicate appointment | Unique `(sub_account_id, crm_appointment_id)`; booking activity uses idempotency key |
| Resurrecting removed leads | Tombstones: `contacts.deleted_at` + `removed_from_queue_at`; stale-event guard compares external `updated_at` |
| Re-running workflow actions | Temporal workflow ids are deterministic; activities carry idempotency keys; side-effecting activities check `workflow_runs.completed_steps` |
| Twilio status out of order | `call_events` store all; `calls.status` only moves forward in the state machine |

### 7.3 Domain events (internal, published on Redis pub/sub → SSE)

Envelope (`packages/types/src/events.ts`):

```ts
{ id, type, organizationId, subAccountId, occurredAt, correlationId, payload }
```

| Event | Payload highlights |
| --- | --- |
| `contact.upserted` | contactId, source, isNew |
| `lead.state_changed` | contactId, from, to, reason |
| `queue.item_added` / `queue.item_reserved` / `queue.item_released` | queueId, contactId, reason |
| `call.state_changed` | callId, state, providerReason? |
| `call.completed` | callId, durationSec, disposition? |
| `disposition.recorded` | callId, code, nextAction |
| `message.received` / `message.status_changed` | conversationId, messageId, status |
| `agent.status_changed` | userId, status |
| `crm.sync_completed` / `crm.sync_failed` | entity, entityId, error? |
| `number.health_changed` | phoneNumberId, from, to |

## 8. Integration boundaries

Interfaces in `packages/integrations/src`:

- `CRMAdapter` — getContact, updateContact, addNote, updateFields, getCalendars, getAvailability,
  createAppointment, addTag, removeTag. `GHLAdapter` first; HubSpot/Zoho/Salesforce later.
- `TelephonyProvider` — createCall, endCall, sendSMS, getRecording, getCallStatus. `TwilioProvider`.
- `TranscriptionProvider`, `LLMProvider`, `VoiceAgentProvider` — AI boundaries.
- `DialStrategy` — `HumanDialStrategy` | `AIDialStrategy`, selected per campaign.

```
Queue Engine
     │  next eligible lead (reserved)
Dial Strategy ──── Human (agent + TelephonyProvider)
     │        └─── AI Voice (VoiceAgentProvider + TelephonyProvider)
Call Outcome (same Call, Disposition, Reporting, Compliance)
     │
Workflow (Temporal follow-up sequence)
```

Credentials (GHL tokens, Twilio auth token, Stripe keys, LLM keys) are stored encrypted (AWS KMS
envelope encryption) and are **never** sent to the browser.

## 9. Workflow engine

- Temporal workflows for follow-up sequences, callbacks and retries. Survive deploys/restarts by design.
- Sequence steps (deterministic, Phase 2): `call`, `wait`, `retry`, `sms`, `callback`, `appointment`,
  `stop`, `dnc`.
- Each step re-checks `ComplianceGate` and lead state before acting (lead may have booked meanwhile).
- Database triggers are never used as the workflow engine.

## 10. Real-time

- SSE (`/v1/stream`) for: call state, incoming calls, agent status, queue counts, new messages,
  sync status. One stream per browser tab, tenant-scoped, heartbeats every 15s, `Last-Event-ID` resume.
- Browser voice uses the Twilio Voice JS SDK (WebRTC) with short-lived access tokens minted by the API.
- Settings and configuration pages use plain request/response. No polling of static data.

## 11. Security

HTTP-only `Secure` `SameSite=Lax` session cookie · CSRF double-submit token for mutations · RBAC guard
on every controller · tenant-scoped repositories + RLS · Redis rate limiting (per IP, per user, per
tenant) · webhook signature verification · KMS-encrypted secrets · append-only audit log · PII-aware
log redaction (phone/email hashed, transcripts never logged) · Zod request validation · Prisma
parameterized queries · React escaping + strict CSP · CORS allowlist · Helmet secure headers.

## 12. Observability

Sentry in web/api/worker; OpenTelemetry traces across HTTP → Temporal → provider calls; structured
logs (pino) with `request_id`, `organization_id`, `call_id`, `campaign_id`, `workflow_id`,
`external_event_id`. Never log secrets, raw transcripts or full phone numbers.

## 13. Testing

| Level | Tooling | Critical cases |
| --- | --- | --- |
| Unit | Vitest | Lifecycle rules, queue ordering, compliance gate, disposition → next action |
| Component | React Testing Library | Disposition picker shortcuts, call state rendering, forms |
| API integration | Nest testing + isolated Postgres (Testcontainers) | GHL ingestion, duplicate webhook, reservation race, permission boundaries |
| Workflow | Temporal test env (time skipping) | No-answer retry, callback, restart survival |
| E2E | Playwright | Agent session, booking, DNC |

## 14. Frontend architecture (`apps/web`)

```
src/
├─ app/
│  ├─ (marketing)/            public site: /, /product, /pricing, …
│  ├─ app/                    authenticated app (shell layout) → /app/*
│  ├─ icon.svg                favicon (simplified mark)
│  └─ globals.css             design tokens
├─ components/
│  ├─ ui/                     primitives (Button, Badge, Card, Tabs, Dialog, Sheet, DataTable …)
│  ├─ domain/                 CallStatus, LeadStateBadge, DispositionPicker, NumberHealth …
│  ├─ shell/                  Sidebar, TopBar, CommandPalette, OrgSwitcher, UserMenu
│  ├─ brand/                  Logo system
│  └─ states/                 EmptyState, ErrorState, PermissionState, IntegrationRequired
├─ features/<module>/         screen-level composition per module (dialer, queue, …)
└─ lib/
   ├─ api/
   │  ├─ types.ts             DialBrioApi interface (the repository contract)
   │  ├─ mock/                seeded, latency-simulating implementation (demo only)
   │  ├─ http/                fetch implementation against /v1 (swap target)
   │  └─ index.ts             selects implementation via NEXT_PUBLIC_API_MODE
   ├─ queries/                TanStack Query hooks + query keys (UI only talks to these)
   ├─ stores/                 Zustand: shell UI state, dialer session UI state (only)
   └─ permissions.ts          role → nav/feature visibility (mirrors API)
```

Rules:
- Components never call `fetch` or the repository directly — only query hooks in `lib/queries`.
- Server state → TanStack Query. Form state → React Hook Form + Zod. Zustand only for small client
  UI state (sidebar collapsed, active dialer session UI, role preview in demo).
- Swapping mock → real: implement `DialBrioApi` in `lib/api/http`, set `NEXT_PUBLIC_API_MODE=http`.
  No component changes.
- Heavy charts are loaded with `next/dynamic`. Client components only where interaction requires.

## 15. Content management (Sanity)

Marketing content and the price book are managed in **Sanity** (project `u470ygx5`, dataset `production`).
Product data (contacts, calls, campaigns) never goes to Sanity; it stays in PostgreSQL behind the API.

**Layout.** A standalone Studio lives in `studio/` (its own Vite app, auto-updating, `pnpm dev:studio` →
localhost:3333). It is **not** embedded in the Next.js app. `apps/web` reads content through `next-sanity`.

| Content | Sanity type(s) | Rendered at |
| --- | --- | --- |
| Price book | `plan`, `usageRate`, `comparisonRow`, `pricingPage` (singleton), `faq` | `/pricing`, home pricing band, trial lines, app Billing, Settings → Billing |
| Blog | `post`, `author`, `category` | `/blog`, `/blog/[slug]` |
| Changelog | `changelogEntry` | `/changelog` |
| Customer stories | `customerStory` | Modelled; page not built yet |
| Site defaults | `siteSettings` (singleton) | Modelled; used for SEO defaults later |

Singletons are locked to fixed ids (`siteSettings`, `pricingPage`) through Studio Structure and cannot be
created from the global menu, duplicated or deleted. Everything else uses Sanity-generated ids and references.

**Price book flow.**

```
Studio (plan / usageRate / comparisonRow / pricingPage / faq)
   │  published
   ▼
apps/web/src/sanity/price-book.ts  getPriceBook()   ← server-only, React cache, Live Content API
   │  maps GROQ result → PriceBook (packages/types/src/pricing.ts)
   │  per-section fallback to DEFAULT_PRICE_BOOK (code) if empty; whole-book fallback if Sanity fails
   ├─► server components: /pricing, PricingBand, Hero/FinalCta/PageHero trial lines
   └─► GET /api/price-book ─► DialBrioApi.getPriceBook() ─► usePriceBook() ─► Billing screen, plan dialog, Settings
```

`planKey` (solo/team/agency/enterprise) and `itemKey` (outbound_min, …) are stable identifiers shared with billing;
editors change names, prices and copy freely but should not change keys once live. Invoice maths in the mock
billing data still uses the code price book; the real billing service (Phase 7) will read the same Sanity values.

**Freshness.** `defineLive` + `<SanityLive />` (root layout) keep pages cached and revalidate them when content is
published; the browser holds one `text/event-stream` connection to the Live Content API. CORS origins configured:
`localhost:3000`, `localhost:3200`, `localhost:3333`, `https://dialbrio.vercel.app`, `https://dialbrio.com`, `https://www.dialbrio.com` — add every new production or custom domain
(`pnpm --filter @dialbrio/studio exec sanity cors add https://… --credentials`).

**Types.** TypeGen is configured in `studio/sanity.cli.ts` to scan `apps/web/src` and write
`apps/web/src/sanity/sanity.types.ts`; run `pnpm typegen` after schema or query changes. Queries live in
`apps/web/src/sanity/queries.ts` with unique names.

**Secrets.** Project id and dataset are public (`NEXT_PUBLIC_SANITY_*`). `SANITY_API_READ_TOKEN` is optional and
server-only (needed later for draft previews / Visual Editing). No write token is used by the web app; seeding runs
through the CLI with the developer's own login (`pnpm sanity:seed`, idempotent).
