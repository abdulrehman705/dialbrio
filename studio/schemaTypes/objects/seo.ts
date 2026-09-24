import {defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons/Search'

/** Page-specific search and social metadata. Falls back to Site settings when empty. */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Shown in search results and browser tabs. Leave empty to use the document title.',
      validation: (rule) => rule.max(60).warning('Keep titles under 60 characters'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Keep descriptions under 160 characters'),
    }),
    defineField({
      name: 'image',
      title: 'Social image',
      type: 'image',
      description: '1200×630 recommended.',
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
  ],
})
