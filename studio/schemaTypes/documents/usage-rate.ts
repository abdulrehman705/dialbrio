import {defineField, defineType} from 'sanity'
import {BoltIcon} from '@sanity/icons/Bolt'

const ITEMS = [
  {title: 'Outbound calls (per minute)', value: 'outbound_min'},
  {title: 'Inbound calls (per minute)', value: 'inbound_min'},
  {title: 'SMS (per segment)', value: 'sms_segment'},
  {title: 'Local phone number (per month)', value: 'local_number'},
  {title: 'Extra agent seat (per month)', value: 'extra_seat'},
  {title: 'AI voice-agent minutes', value: 'ai_min'},
]

/** A metered usage price, identical on every plan. `itemKey` maps to what billing meters. */
export const usageRate = defineType({
  name: 'usageRate',
  title: 'Usage rate',
  type: 'document',
  icon: BoltIcon,
  fields: [
    defineField({
      name: 'itemKey',
      title: 'Metered item',
      type: 'string',
      options: {list: ITEMS},
      description: 'What billing meters. Do not change once live.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'unitPriceCents',
      title: 'Unit price (cents)',
      type: 'number',
      description: 'Price per unit in cents, e.g. 1.5 for 1.5¢/min, 200 for $2/number.',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({name: 'unit', title: 'Unit', type: 'string', description: 'e.g. min, segment, number, seat.', validation: (rule) => rule.required()}),
    defineField({name: 'displayRate', title: 'Display rate', type: 'string', description: 'As shown on the site, e.g. "1.5¢ / min".', validation: (rule) => rule.required()}),
    defineField({name: 'competitorRate', title: 'Competitor rate', type: 'string', description: 'e.g. "2¢ / min" or "not published".'}),
    defineField({name: 'savingsLabel', title: 'Savings label', type: 'string', description: 'Optional chip, e.g. "−25%".'}),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number', validation: (rule) => rule.required().integer()}),
  ],
  orderings: [{title: 'Sort order', name: 'sortOrderAsc', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {select: {title: 'label', subtitle: 'displayRate'}},
})
