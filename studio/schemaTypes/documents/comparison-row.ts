import {defineField, defineType} from 'sanity'
import {ThListIcon} from '@sanity/icons/ThList'

/** A row in the head-to-head pricing comparison. Column labels live on the Pricing page. */
export const comparisonRow = defineType({
  name: 'comparisonRow',
  title: 'Comparison row',
  type: 'document',
  icon: ThListIcon,
  fields: [
    defineField({name: 'scenario', title: 'Scenario', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'ours', title: 'DialBrio', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'firstCompetitor', title: 'First competitor', type: 'string'}),
    defineField({name: 'secondCompetitor', title: 'Second competitor', type: 'string'}),
    defineField({
      name: 'kind',
      title: 'Row type',
      type: 'string',
      initialValue: 'cost',
      options: {
        list: [
          {title: 'Monthly cost scenario', value: 'cost'},
          {title: 'Feature', value: 'feature'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number', validation: (rule) => rule.required().integer()}),
  ],
  orderings: [{title: 'Sort order', name: 'sortOrderAsc', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {select: {title: 'scenario', subtitle: 'ours'}},
})
