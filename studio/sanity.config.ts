import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {SINGLETON_TYPES, schemaTypes} from './schemaTypes'
import {structure} from './structure'

const singletons = new Set<string>(SINGLETON_TYPES)

export default defineConfig({
  name: 'default',
  title: 'DialBrio',

  projectId: 'u470ygx5',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Singletons can't be created from the global "new document" menu.
    templates: (templates) => templates.filter(({schemaType}) => !singletons.has(schemaType)),
  },

  document: {
    // Singletons can't be duplicated or deleted.
    actions: (actions, {schemaType}) =>
      singletons.has(schemaType)
        ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
})
