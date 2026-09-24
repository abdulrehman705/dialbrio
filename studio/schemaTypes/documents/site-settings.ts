import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/** Singleton (id: siteSettings). Site-wide marketing defaults. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({name: 'title', title: 'Site title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'tagline', title: 'Tagline', type: 'string', description: 'e.g. "More conversations. Real growth."'}),
    defineField({name: 'description', title: 'Default description', type: 'text', rows: 3, validation: (rule) => rule.max(160)}),
    defineField({
      name: 'announcement',
      title: 'Announcement',
      type: 'object',
      description: 'Optional one-line notice above the marketing header.',
      fields: [
        defineField({name: 'text', title: 'Text', type: 'string'}),
        defineField({name: 'href', title: 'Link', type: 'string'}),
      ],
    }),
    defineField({name: 'seo', title: 'Default SEO', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
