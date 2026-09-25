import { defineQuery } from "next-sanity";

/** Everything the pricing page and billing need, in one round trip. */
export const PRICE_BOOK_QUERY = defineQuery(`{
  "page": *[_id == "pricingPage"][0]{
    annualDiscountPercent,
    trial{ days, freeMinutes, cardRequired },
    competitors[]{ name, sourceUrl },
    comparisonCheckedOn,
    comparisonFootnote,
    "faq": faqs[]->{ question, answer }
  },
  "plans": *[_type == "plan" && defined(planKey)] | order(sortOrder asc){
    planKey, name, audience, monthlyPrice, includedSeats, seatsNote, includedAiMinutes,
    "inheritsFrom": inheritsFrom->planKey,
    highlights[]{ _key, text, availability, plannedNote },
    cta, badge
  },
  "usageRates": *[_type == "usageRate" && defined(itemKey)] | order(sortOrder asc){
    itemKey, label, unitPriceCents, unit, displayRate
  },
  "comparison": *[_type == "comparisonRow"] | order(sortOrder asc){
    scenario, ours, competitorValues[]{ competitor, value }
  }
}`);

export const POSTS_INDEX_QUERY = defineQuery(`*[_type == "post" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc)[0...24]{
  _id, title, "slug": slug.current, excerpt, publishedAt,
  coverImage{ asset, alt, hotspot, crop },
  "author": author->{ name, role },
  "categories": categories[]->title
}`);

export const POST_DETAIL_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, excerpt, publishedAt, body,
  coverImage{ asset, alt, hotspot, crop },
  "author": author->{ name, role, bio },
  "categories": categories[]->title,
  seo{ title, description }
}`);

export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`);

export const CHANGELOG_QUERY = defineQuery(`*[_type == "changelogEntry"] | order(releasedAt desc)[0...50]{
  _id, title, kind, releasedAt, summary
}`);
