/**
 * Content fix: voicemail drop exists in the product but isn't sold, so it's removed from plan highlights.
 * Run from studio/: pnpm exec sanity exec scripts/remove-voicemail-drop.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-09-24'}).withConfig({perspective: 'raw'})

async function main() {
  const hits = await client.fetch<{_id: string; highlights: {_key: string; text: string}[]}[]>(
    `*[_type == "plan" && count(highlights[text match "*oicemail drop*"]) > 0]{_id, "highlights": highlights[text match "*oicemail drop*"]{_key, text}}`,
  )
  for (const doc of hits) {
    for (const h of doc.highlights) {
      const text = h.text.replace(/voicemail drop\s*\+\s*/i, '').replace(/\s*\+\s*voicemail drop/i, '').trim()
      await client.patch(doc._id).set({[`highlights[_key=="${h._key}"].text`]: text}).commit()
      console.log(`${doc._id}: "${h.text}" → "${text}"`)
    }
  }
  const left = await client.fetch<number>(`count(*[_type == "plan" && count(highlights[text match "*oicemail drop*"]) > 0])`)
  console.log(`plans still mentioning voicemail drop: ${left}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
