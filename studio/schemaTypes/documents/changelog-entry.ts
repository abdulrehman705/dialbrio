import {defineField, defineType} from 'sanity'
import {ClockIcon} from '@sanity/icons/Clock'

export const changelogEntry = defineType({
  name: 'changelogEntry',
  title: 'Changelog entry',
  type: 'document',
  icon: ClockIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Improved', value: 'improved'},
          {title: 'Fixed', value: 'fixed'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'releasedAt', title: 'Released on', type: 'date', validation: (rule) => rule.required()}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'body', title: 'Details', type: 'blockContent'}),
  ],
  orderings: [{title: 'Newest first', name: 'releasedAtDesc', by: [{field: 'releasedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'releasedAt'}},
})
