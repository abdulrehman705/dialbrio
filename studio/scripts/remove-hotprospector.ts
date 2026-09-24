/**
 * One-off content migration: removes every HotProspector reference from the dataset and replaces the
 * two-column comparison with the competitor list (Aloware, Kixie, Five9, Wavv) from @dialbrio/types.
 * Safe to re-run. Covers published documents and drafts.
 *
 * Run from studio/: pnpm exec sanity exec scripts/remove-hotprospector.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'
import {COMPARISON, COMPARISON_CHECKED_ON, COMPARISON_FOOTNOTE, COMPETITORS} from '@dialbrio/types'

const client = getCliClient({apiVersion: '2026-09-24'}).withConfig({perspective: 'raw'})

async function main() {
  // 1. Plans: drop seat notes that compare against HotProspector.
  const plans = await client.fetch<{_id: string}[]>(`*[_type == "plan" && seatsNote match "*HotProspector*"]{_id}`)
  for (const {_id} of plans) await client.patch(_id).unset(['seatsNote']).commit()
  console.log(`plans: cleared seat notes on ${plans.length}`)

  // 2. Usage rates: the competitor rate and savings chip were HotProspector comparisons.
  const rates = await client.fetch<{_id: string}[]>(`*[_type == "usageRate" && (defined(competitorRate) || defined(savingsLabel))]{_id}`)
  for (const {_id} of rates) await client.patch(_id).unset(['competitorRate', 'savingsLabel']).commit()
  console.log(`usage rates: cleared competitor fields on ${rates.length}`)

  // 3. Comparison rows: replace the old two-competitor rows with the sourced competitor table.
  const oldRows = await client.fetch<string[]>(`*[_type == "comparisonRow" && (defined(firstCompetitor) || defined(secondCompetitor) || defined(kind))]._id`)
  if (oldRows.length) {
    const tx = client.transaction()
    oldRows.forEach((id) => tx.delete(id))
    await tx.commit()
  }
  console.log(`comparison: removed ${oldRows.length} old rows`)
  for (const [i, row] of COMPARISON.entries()) {
    const exists = await client.fetch<string | null>(`*[_type == "comparisonRow" && scenario == $s][0]._id`, {s: row.scenario})
    if (exists) continue
    await client.create({
      _type: 'comparisonRow',
      scenario: row.scenario,
      ours: row.us,
      competitorValues: COMPETITORS.map((c, j) => ({_type: 'competitorValue', _key: `c${j}`, competitor: c.name, value: row.values[c.name] ?? 'Not published'})),
      sortOrder: (i + 1) * 10,
    })
    console.log(`comparison "${row.scenario}": created`)
  }

  // 4. Pricing page (published + draft): competitor list, checked date, source note.
  for (const id of ['pricingPage', 'drafts.pricingPage']) {
    const doc = await client.getDocument(id)
    if (!doc) continue
    await client
      .patch(id)
      .unset(['competitorLabels'])
      .set({
        competitors: COMPETITORS.map((c, j) => ({_type: 'competitor', _key: `k${j}`, name: c.name, sourceUrl: c.sourceUrl})),
        comparisonCheckedOn: COMPARISON_CHECKED_ON,
        comparisonFootnote: COMPARISON_FOOTNOTE,
      })
      .commit()
    console.log(`${id}: competitors set, HotProspector labels removed`)
  }

  const left = await client.fetch<number>(`count(*[_type in ["plan","usageRate","comparisonRow","pricingPage","faq","siteSettings"] && [seatsNote, competitorRate, comparisonFootnote, question, answer, scenario, ours] match "*HotProspector*"])`)
  console.log(`remaining documents mentioning HotProspector: ${left}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
