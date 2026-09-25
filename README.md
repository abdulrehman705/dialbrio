# DialBrio Website

Marketing website for DialBrio, the sales engagement and parallel dialing platform: public pages, pricing,
waitlist, blog and changelog, with content managed in Sanity. The product app and its backend live in
separate repos.

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | Website structure, Sanity content model and price book flow, environment |
| [`docs/design.md`](docs/design.md) | Design system source of truth: brand, logo, Mono tokens, components |
| [`docs/design-handoff/mono`](docs/design-handoff/mono) | Figma handoff kit for the Mono theme |

## Repository

```
src/                Next.js 16 (App Router) website, at the repo root
studio/             Sanity Studio (standalone): content, price book, waitlist signups
```

## Getting started

Requires Node 22+ and pnpm 11.

```bash
pnpm install
pnpm dev          # website at http://localhost:3000
pnpm dev:studio   # Sanity Studio at http://localhost:3333
pnpm dev:all      # both, in parallel
pnpm typecheck
pnpm build
```

Copy `.env.example` to `.env.local` (the Sanity project id and dataset are prefilled).
Set `NEXT_PUBLIC_APP_LOGIN_URL` to the product app's sign-in page to show "Log in" in the header.

### Content (Sanity)

Marketing content and pricing are edited in the Studio (`studio/`, project `u470ygx5`, dataset `production`):
plans, usage rates, comparison rows, pricing FAQs, blog posts, changelog, customer stories, and waitlist
signups. The site reads them live; if Sanity is unreachable pricing falls back to the code price book.

```bash
pnpm typegen         # regenerate query types after schema/query changes
pnpm sanity:seed     # (re)seed the launch price book; skips anything that already exists
```
