import {defineArrayMember, defineField, defineType} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'

const PLAN_KEYS = [
  {title: 'Solo', value: 'solo'},
  {title: 'Team', value: 'team'},
  {title: 'Agency', value: 'agency'},
  {title: 'Enterprise', value: 'enterprise'},
]

/** A subscription plan. `planKey` is the stable identifier the app and billing use. */
export const plan = defineType({
  name: 'plan',
  title: 'Plan',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'planKey',
      title: 'Plan key',
      type: 'string',
      description: 'Stable identifier used by the app and billing. Do not change once live.',
      options: {list: PLAN_KEYS, layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'audience', title: 'Who it is for', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'monthlyPrice',
      title: 'Monthly price (USD)',
      type: 'number',
      description: 'Leave empty for "Custom" pricing.',
      validation: (rule) => rule.min(0).precision(2),
    }),
    defineField({
      name: 'includedSeats',
      title: 'Included seats',
      type: 'number',
      description: 'Leave empty for custom.',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({name: 'seatsNote', title: 'Seats note', type: 'string', description: 'e.g. "vs. 3 at HotProspector".'}),
    defineField({
      name: 'includedAiMinutes',
      title: 'Included AI voice minutes',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'inheritsFrom',
      title: 'Includes everything in',
      type: 'reference',
      to: [{type: 'plan'}],
      description: 'Renders "Everything in Team, plus:" above the highlights.',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [defineArrayMember({type: 'planHighlight'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'string',
      initialValue: 'trial',
      options: {
        list: [
          {title: 'Start free trial', value: 'trial'},
          {title: 'Talk to sales', value: 'sales'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'string',
      options: {list: [{title: 'Most popular', value: 'popular'}], layout: 'radio'},
      description: 'Highlight one plan as the recommended choice.',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers show first.',
      validation: (rule) => rule.required().integer(),
    }),
  ],
  orderings: [{title: 'Sort order', name: 'sortOrderAsc', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', price: 'monthlyPrice', seats: 'includedSeats'},
    prepare: ({title, price, seats}) => ({
      title,
      subtitle: `${typeof price === 'number' ? `$${price}/mo` : 'Custom'}${seats ? ` · ${seats} seats` : ''}`,
    }),
  },
})
