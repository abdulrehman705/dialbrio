# DialBrio Studio

Sanity Studio for the DialBrio website (project `u470ygx5`, dataset `production`): price book, blog,
changelog, FAQs and waitlist signups. Standalone app; the website reads content through `next-sanity`.

```bash
pnpm dev             # http://localhost:3333
pnpm typegen         # extract schema and regenerate ../src/sanity/sanity.types.ts
pnpm seed            # seed the launch price book (idempotent)
pnpm schema:deploy   # publish the schema to Sanity
pnpm deploy          # host the Studio on *.sanity.studio
pnpm lint
```

Content model and price book flow: `../docs/architecture.md` §3.
