# DialBrio Website Architecture

This repo is the **marketing website** only: the public site, the waitlist, the blog and changelog, and the
Sanity Studio that edits them. The product app (dialer, queue, campaigns, …) and its backend live in separate
repos. The website links to the product only through `NEXT_PUBLIC_APP_LOGIN_URL`.

## 1. Repository layout

```
apps/web            Next.js 16 (App Router): the website
studio              Sanity Studio (standalone): marketing content, price book, waitlist signups
packages/types      Price book types + defaults, and the product vocabulary the site illustrates
packages/tsconfig   Base TypeScript config
docs/               Design system (design.md), Mono handoff kit, colour studies, this file
```

pnpm workspace (`pnpm-workspace.yaml`) lists exactly those four packages.

## 2. Website (`apps/web`)

```
src/
├─ app/
│  ├─ (marketing)/          /, /product, /dialer, /ai, /conversations, /integrations, /pricing, /security,
│  │                        /blog, /blog/[slug], /changelog  (shared header/footer layout)
│  ├─ waitlist/             waitlist page (AuthShell + WaitlistForm)
│  ├─ api/waitlist/         POST → creates a `waitlistEntry` document in Sanity
│  ├─ get-started/          redirects to /waitlist, keeping ?plan
│  ├─ login/                redirects to NEXT_PUBLIC_APP_LOGIN_URL (or /waitlist when unset)
│  ├─ icon.svg              favicon (simplified mark)
│  └─ globals.css           Mono design tokens (docs/design.md)
├─ components/
│  ├─ marketing/            page sections, header/footer, pricing, hero illustration, status badges
│  ├─ reactbits/            vendored React Bits animations (gsap / motion)
│  ├─ ui/                   primitives used by the site (Button, Badge, Input, Select, Dialog/Sheet, Tooltip …)
│  └─ brand/                logo
├─ lib/                     utils, links (product login URL), waitlist validation
└─ sanity/                  env, client, defineLive, queries, price book, generated types
```

Rules:
- Pages are server components; client components only where interaction or animation needs them.
- Content comes from Sanity through `sanityFetch`; pricing always goes through `getPriceBook()`.
- The hero "product" illustration is static marketing content, not live data.

## 3. Content management (Sanity)

Project `u470ygx5`, dataset `production`. The standalone Studio lives in `studio/` (`pnpm dev:studio` →
localhost:3333); it is not embedded in the Next.js app.

| Content | Sanity type(s) | Rendered at |
| --- | --- | --- |
| Price book | `plan`, `usageRate`, `comparisonRow`, `pricingPage` (singleton), `faq` | `/pricing`, home pricing band, trial lines |
| Blog | `post`, `author`, `category` | `/blog`, `/blog/[slug]` |
| Changelog | `changelogEntry` | `/changelog` |
| Waitlist | `waitlistEntry` (read-only in Studio) | written by `/api/waitlist` |
| Customer stories | `customerStory` | Modelled; page not built yet |
| Site defaults | `siteSettings` (singleton) | Modelled; used for SEO defaults later |

Singletons are locked to fixed ids (`siteSettings`, `pricingPage`) through Studio Structure and cannot be
created from the global menu, duplicated or deleted.

**Price book flow.**

```
Studio (plan / usageRate / comparisonRow / pricingPage / faq)
   │  published
   ▼
apps/web/src/sanity/price-book.ts  getPriceBook()   ← server-only, React cache, Live Content API
   │  maps GROQ result → PriceBook (packages/types/src/pricing.ts)
   │  per-section fallback to DEFAULT_PRICE_BOOK (code) if empty; whole-book fallback if Sanity fails
   └─► /pricing, PricingBand, Hero/FinalCta/PageHero trial lines
```

`planKey` (solo/team/agency/enterprise) and `itemKey` (outbound_min, …) are stable identifiers the product's
billing also uses; editors change names, prices and copy freely but should not change keys once live. The
product repo can read the same documents from Sanity directly.

**Freshness.** `defineLive` + `<SanityLive />` (root layout) keep pages cached and revalidate them when content is
published; the browser holds one `text/event-stream` connection to the Live Content API. CORS origins configured:
`localhost:3000`, `localhost:3200`, `localhost:3333`, `https://dialbrio.vercel.app`, `https://dialbrio.com`,
`https://www.dialbrio.com`. Add every new domain
(`pnpm --filter @dialbrio/studio exec sanity cors add https://… --credentials`).

**Types.** TypeGen is configured in `studio/sanity.cli.ts` to scan `apps/web/src` and write
`apps/web/src/sanity/sanity.types.ts`; run `pnpm typegen` after schema or query changes.

## 4. Environment

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | public | Sanity project |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | public | Studio link |
| `NEXT_PUBLIC_APP_LOGIN_URL` | public | Product sign-in page; "Log in" is hidden when empty |
| `SANITY_API_READ_TOKEN` | server-only, optional | Draft previews later |
| `SANITY_API_WRITE_TOKEN` | server-only | Lets `/api/waitlist` save signups; without it the form reports signups aren't open |

Never prefix a token with `NEXT_PUBLIC_`. Seeding runs through the CLI with the developer's own login
(`pnpm sanity:seed`, idempotent).
