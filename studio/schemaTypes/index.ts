import {author} from './documents/author'
import {category} from './documents/category'
import {changelogEntry} from './documents/changelog-entry'
import {comparisonRow} from './documents/comparison-row'
import {customerStory} from './documents/customer-story'
import {faq} from './documents/faq'
import {plan} from './documents/plan'
import {post} from './documents/post'
import {pricingPage} from './documents/pricing-page'
import {siteSettings} from './documents/site-settings'
import {usageRate} from './documents/usage-rate'
import {blockContent} from './objects/block-content'
import {planHighlight} from './objects/plan-highlight'
import {seo} from './objects/seo'

/** Singleton document types; enforced through Structure (see ../structure.ts). */
export const SINGLETON_TYPES = ['siteSettings', 'pricingPage'] as const

export const schemaTypes = [
  // Singletons
  siteSettings,
  pricingPage,
  // Pricing
  plan,
  usageRate,
  comparisonRow,
  faq,
  // Marketing content
  post,
  author,
  category,
  customerStory,
  changelogEntry,
  // Objects
  seo,
  blockContent,
  planHighlight,
]
