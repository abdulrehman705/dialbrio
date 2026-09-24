import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import type {ComponentType} from 'react'
import {CogIcon} from '@sanity/icons/Cog'
import {CreditCardIcon} from '@sanity/icons/CreditCard'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {SINGLETON_TYPES} from './schemaTypes'

/** Singletons are locked to a fixed document id equal to their type name. */
function singleton(S: StructureBuilder, typeName: string, title: string, icon: ComponentType) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(typeName).documentId(typeName).title(title))
}

const GROUPED = new Set<string>([
  ...SINGLETON_TYPES,
  'plan',
  'usageRate',
  'comparisonRow',
  'faq',
  'post',
  'author',
  'category',
  'customerStory',
  'changelogEntry',
  'waitlistEntry',
])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('DialBrio')
    .items([
      singleton(S, 'siteSettings', 'Site settings', CogIcon),
      S.divider(),
      S.listItem()
        .title('Pricing')
        .icon(CreditCardIcon)
        .child(
          S.list()
            .title('Pricing')
            .items([
              singleton(S, 'pricingPage', 'Pricing page', CreditCardIcon),
              S.divider(),
              S.documentTypeListItem('plan').title('Plans'),
              S.documentTypeListItem('usageRate').title('Usage rates'),
              S.documentTypeListItem('comparisonRow').title('Comparison rows'),
              S.documentTypeListItem('faq').title('FAQs'),
            ]),
        ),
      S.listItem()
        .title('Marketing content')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Marketing content')
            .items([
              S.documentTypeListItem('post').title('Blog posts'),
              S.documentTypeListItem('customerStory').title('Customer stories'),
              S.documentTypeListItem('changelogEntry').title('Changelog'),
              S.divider(),
              S.documentTypeListItem('author').title('Authors'),
              S.documentTypeListItem('category').title('Categories'),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('waitlistEntry').title('Waitlist').icon(EnvelopeIcon),
      // Anything added later that isn't grouped above.
      ...S.documentTypeListItems().filter((item) => !GROUPED.has(item.getId() as string)),
    ])
