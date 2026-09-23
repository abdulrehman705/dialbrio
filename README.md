# DialBrio

Sales engagement and intelligent dialing platform: calling, follow-up, qualification and appointment
booking for outbound sales teams. GoHighLevel stays the CRM of record; DialBrio owns operational
sales execution (campaigns, queues, lead lifecycle, calls, dispositions, conversations, compliance, reporting).

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/product-map.md`](docs/product-map.md) | Personas, roles, navigation, screen inventory, lifecycle, MVP scope, phases |
| [`docs/design.md`](docs/design.md) | Design system source of truth: brand, logo, tokens, components, status system, dialer UI, accessibility |
| [`docs/architecture.md`](docs/architecture.md) | Modular monolith, data model, API and event contracts, idempotency, adapters, frontend data layer |
| [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) | Canonical database model |

## Repository

```
apps/web            Next.js 16 (App Router) — marketing site + application (this pass)
apps/api            NestJS API (Phase 1) — Prisma schema lives here now
apps/worker         Temporal workers + webhook processors (Phase 1)
packages/types      Shared domain types, API/event contracts, permission map
packages/integrations  CRMAdapter, TelephonyProvider, AI providers, DialStrategy interfaces
packages/tsconfig   Base TypeScript config
```

## Getting started

Requires Node 22+ and pnpm 11.

```bash
pnpm install
pnpm dev          # http://localhost:3000  (marketing at /, app at /app)
pnpm typecheck
pnpm build
```

### Data mode

The UI talks to a single repository contract, `DialBrioApi` (`apps/web/src/lib/api/types.ts`), only
through TanStack Query hooks in `apps/web/src/lib/queries`.

- `NEXT_PUBLIC_API_MODE=mock` (default): seeded, deterministic demo data in `src/lib/api/mock`, with a
  simulated call lifecycle delivered through the same realtime interface as the production SSE stream.
- `NEXT_PUBLIC_API_MODE=http`: the fetch implementation in `src/lib/api/http` against `/v1` (Phase 1+).

Switching modes requires no component changes. In mock mode the user menu offers a **preview role**
switch (Admin / Manager / Agent) so reviewers can see role-based navigation; production roles come from
`/v1/me` and are enforced by the API.
