import {defineArrayMember, defineField, defineType} from 'sanity'
import {CreditCardIcon} from '@sanity/icons/CreditCard'

/** Singleton (id: pricingPage). Page-level pricing terms; plans and rates are their own documents. */
export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing page',
  type: 'document',
  icon: CreditCardIcon,
  groups: [
    {name: 'terms', title: 'Terms', default: true},
    {name: 'comparison', title: 'Comparison'},
    {name: 'faq', title: 'FAQ'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'annualDiscountPercent',
      title: 'Annual discount (%)',
      type: 'number',
      group: 'terms',
      initialValue: 20,
      validation: (rule) => rule.required().min(0).max(90),
    }),
    defineField({
      name: 'trial',
      title: 'Free trial',
      type: 'object',
      group: 'terms',
      fields: [
        defineField({name: 'days', title: 'Days', type: 'number', validation: (rule) => rule.required().min(0)}),
        defineField({name: 'freeMinutes', title: 'Free minutes', type: 'number', validation: (rule) => rule.required().min(0)}),
        defineField({name: 'cardRequired', title: 'Credit card required', type: 'boolean', initialValue: false}),
      ],
    }),
    defineField({
      name: 'competitorLabels',
      title: 'Competitor column labels',
      type: 'object',
      group: 'comparison',
      description: 'Headers for the two competitor columns in the comparison tables.',
      fields: [
        defineField({name: 'first', title: 'First competitor', type: 'string'}),
        defineField({name: 'second', title: 'Second competitor', type: 'string'}),
      ],
    }),
    defineField({
      name: 'comparisonFootnote',
      title: 'Comparison footnote',
      type: 'text',
      rows: 3,
      group: 'comparison',
      description: 'Source and date for competitor prices.',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'faq',
      of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Pricing page'})},
})
