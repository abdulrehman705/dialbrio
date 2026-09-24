import {defineField, defineType} from 'sanity'

/** One line in a plan's feature list. Roadmap items are marked "planned" on the site. */
export const planHighlight = defineType({
  name: 'planHighlight',
  title: 'Plan highlight',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'Text', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      initialValue: 'available',
      options: {
        list: [
          {title: 'Available today', value: 'available'},
          {title: 'Planned (shows a "planned" marker)', value: 'planned'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'plannedNote',
      title: 'Planned note',
      type: 'string',
      description: 'Tooltip on the "planned" marker, e.g. "AI coaching ships in Phase 5".',
      hidden: ({parent}) => parent?.availability !== 'planned',
    }),
  ],
  preview: {
    select: {title: 'text', availability: 'availability'},
    prepare: ({title, availability}) => ({title, subtitle: availability === 'planned' ? 'Planned' : 'Available'}),
  },
})
