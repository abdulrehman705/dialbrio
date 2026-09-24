import {defineArrayMember, defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'

export const customerStory = defineType({
  name: 'customerStory',
  title: 'Customer story',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({name: 'company', title: 'Company', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'company'}, validation: (rule) => rule.required()}),
    defineField({name: 'industry', title: 'Industry', type: 'string', description: 'e.g. Solar, Med spa, Home services.'}),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: (rule) => rule.required().max(240)}),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'object',
      fields: [
        defineField({name: 'text', title: 'Quote', type: 'text', rows: 3}),
        defineField({name: 'person', title: 'Person', type: 'string'}),
        defineField({name: 'role', title: 'Role', type: 'string'}),
      ],
    }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      description: 'Headline numbers, e.g. "3.2×" / "more connects per rep".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'result',
          fields: [
            defineField({name: 'metric', title: 'Metric', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'metric', subtitle: 'label'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({name: 'body', title: 'Story', type: 'blockContent'}),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime', validation: (rule) => rule.required()}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'company', subtitle: 'industry', media: 'logo'}},
})
