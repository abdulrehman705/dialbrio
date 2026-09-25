import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'u470ygx5',
    dataset: 'production',
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    // The Next.js website lives at the repo root.
    path: '../src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../src/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
})
