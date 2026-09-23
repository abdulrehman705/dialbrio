# @dialbrio/api

NestJS modular monolith. **Not implemented in this pass** — scheduled for Phase 1 (see `docs/product-map.md` §12).

What exists now:

- `prisma/schema.prisma` — the canonical data model (`pnpm prisma:validate`).
- Contracts consumed by this service live in `packages/types` (domain, API, events, permissions)
  and `packages/integrations` (CRM, telephony, AI and dial-strategy adapters).

Module layout, webhook pipeline, idempotency rules and security requirements: `docs/architecture.md`.
