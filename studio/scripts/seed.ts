/**
 * Seeds Sanity with DialBrio's launch price book and site settings from the code constants in
 * src/lib/pricing.ts, so the site shows the same prices on day one.
 *
 * Idempotent: documents that already exist (matched by planKey / itemKey / scenario / question)
 * are left untouched, so editors' changes in the Studio are never overwritten.
 *
 * Run from studio/: pnpm seed   (uses your logged-in Sanity session)
 */
import {getCliClient} from 'sanity/cli'
import {
  ANNUAL_DISCOUNT,
  COMPARISON,
  COMPARISON_CHECKED_ON,
  COMPETITORS,
  COMPARISON_FOOTNOTE,
  PLANS,
  PRICING_FAQ,
  TRIAL,
  USAGE_RATES,
  plannedStatus,
} from '../../src/lib/pricing'

const client = getCliClient({apiVersion: '2026-09-24'})

async function exists(query: string, params: Record<string, unknown>) {
  return client.fetch<string | null>(query, params)
}

async function main() {
  // Plans (created in order so "inheritsFrom" can reference the returned _id)
  const planIds = new Map<string, string>()
  for (const [i, p] of PLANS.entries()) {
    const found = await exists(`*[_type == "plan" && planKey == $key][0]._id`, {key: p.id})
    if (found) {
      planIds.set(p.id, found)
      console.log(`plan ${p.id}: exists, skipped`)
      continue
    }
    const doc = await client.create({
      _type: 'plan',
      name: p.name,
      planKey: p.id,
      audience: p.audience,
      monthlyPrice: p.monthlyCents === null ? undefined : p.monthlyCents / 100,
      includedSeats: p.includedSeats ?? undefined,
      seatsNote: p.seatsNote,
      includedAiMinutes: p.includedAiMinutes,
      inheritsFrom: p.inheritsFrom && planIds.has(p.inheritsFrom) ? {_type: 'reference', _ref: planIds.get(p.inheritsFrom)!} : undefined,
      highlights: p.highlights.map((text, j) => {
        const note = plannedStatus(text)
        return {_type: 'planHighlight', _key: `h${j}`, text, availability: note ? 'planned' : 'available', plannedNote: note ?? undefined}
      }),
      cta: p.cta,
      badge: p.popular ? 'popular' : undefined,
      sortOrder: (i + 1) * 10,
    })
    planIds.set(p.id, doc._id)
    console.log(`plan ${p.id}: created ${doc._id}`)
  }

  // Usage rates
  for (const [i, r] of USAGE_RATES.entries()) {
    if (await exists(`*[_type == "usageRate" && itemKey == $key][0]._id`, {key: r.id})) {
      console.log(`usage ${r.id}: exists, skipped`)
      continue
    }
    await client.create({
      _type: 'usageRate',
      itemKey: r.id,
      label: r.label,
      unitPriceCents: r.unitMilliCents / 100,
      unit: r.unit,
      displayRate: r.rate,
      sortOrder: (i + 1) * 10,
    })
    console.log(`usage ${r.id}: created`)
  }

  // Comparison rows
  for (const [i, row] of COMPARISON.entries()) {
    if (await exists(`*[_type == "comparisonRow" && scenario == $s][0]._id`, {s: row.scenario})) {
      console.log(`comparison "${row.scenario}": exists, skipped`)
      continue
    }
    await client.create({
      _type: 'comparisonRow',
      scenario: row.scenario,
      ours: row.us,
      competitorValues: COMPETITORS.map((c, j) => ({_type: 'competitorValue', _key: `c${j}`, competitor: c.name, value: row.values[c.name] ?? 'Not published'})),
      sortOrder: (i + 1) * 10,
    })
    console.log(`comparison "${row.scenario}": created`)
  }

  // FAQs
  const faqIds: string[] = []
  for (const f of PRICING_FAQ) {
    const found = await exists(`*[_type == "faq" && question == $q][0]._id`, {q: f.q})
    if (found) {
      faqIds.push(found)
      console.log(`faq "${f.q}": exists, skipped`)
      continue
    }
    const doc = await client.create({_type: 'faq', question: f.q, answer: f.a, topic: 'pricing'})
    faqIds.push(doc._id)
    console.log(`faq "${f.q}": created`)
  }

  // Singletons (fixed ids enforced by Studio structure)
  await client.createIfNotExists({
    _id: 'pricingPage',
    _type: 'pricingPage',
    annualDiscountPercent: Math.round(ANNUAL_DISCOUNT * 100),
    trial: {days: TRIAL.days, freeMinutes: TRIAL.freeMinutes, cardRequired: TRIAL.cardRequired},
    competitors: COMPETITORS.map((c, j) => ({_type: 'competitor', _key: `k${j}`, name: c.name, sourceUrl: c.sourceUrl})),
    comparisonCheckedOn: COMPARISON_CHECKED_ON,
    comparisonFootnote: COMPARISON_FOOTNOTE,
    faqs: faqIds.map((id, i) => ({_type: 'reference', _ref: id, _key: `f${i}`})),
  })
  await client.createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    title: 'DialBrio',
    tagline: 'More conversations. Real growth.',
    description: 'A modern sales engagement platform for calling, follow-up, qualification and appointment booking.',
  })
  console.log('singletons: ensured pricingPage, siteSettings')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
