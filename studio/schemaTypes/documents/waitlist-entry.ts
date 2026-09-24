import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'

/**
 * A waitlist signup from the website (/waitlist). Created by the web app's server route with a
 * write token; read-only in the Studio so entries stay as submitted.
 */
export const waitlistEntry = defineType({
  name: 'waitlistEntry',
  title: 'Waitlist signup',
  type: 'document',
  icon: EnvelopeIcon,
  readOnly: true,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({name: 'email', title: 'Work email', type: 'string'}),
    defineField({name: 'company', title: 'Company or agency', type: 'string'}),
    defineField({name: 'teamSize', title: 'Agents', type: 'string'}),
    defineField({name: 'crm', title: 'CRM', type: 'string'}),
    defineField({name: 'planInterest', title: 'Plan interest', type: 'string', description: 'From the pricing card they clicked, if any.'}),
    defineField({name: 'submittedAt', title: 'Submitted at', type: 'datetime'}),
  ],
  orderings: [{title: 'Newest first', name: 'submittedAtDesc', by: [{field: 'submittedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'email', company: 'company', size: 'teamSize'},
    prepare: ({title, company, size}) => ({title, subtitle: [company, size && `${size} agents`].filter(Boolean).join(' · ')}),
  },
})
