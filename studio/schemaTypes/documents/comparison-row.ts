import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThListIcon} from '@sanity/icons/ThList'

/** A row in the pricing comparison. Competitor columns are defined on the Pricing page. */
export const comparisonRow = defineType({
  name: 'comparisonRow',
  title: 'Comparison row',
  type: 'document',
  icon: ThListIcon,
  fields: [
    defineField({name: 'scenario', title: 'Scenario', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'ours', title: 'DialBrio', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'competitorValues',
      title: 'Competitor values',
      type: 'array',
      description: 'One value per competitor listed on the Pricing page (matched by name). Write "Not published" when a vendor does not publish it.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'competitorValue',
          fields: [
            defineField({name: 'competitor', title: 'Competitor', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'value', title: 'Value', type: 'string', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'competitor', subtitle: 'value'}},
        }),
      ],
    }),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number', validation: (rule) => rule.required().integer()}),
  ],
  orderings: [{title: 'Sort order', name: 'sortOrderAsc', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {select: {title: 'scenario', subtitle: 'ours'}},
})
