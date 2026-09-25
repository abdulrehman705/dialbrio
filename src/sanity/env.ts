/**
 * Public Sanity configuration. These values are safe for the browser (project id and dataset are
 * not secrets). Tokens are read only in server modules (see lib/live.ts).
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
/** Hard-coded on purpose: bump deliberately when adopting new API behaviour. */
export const apiVersion = "2026-09-24";
/** Standalone Studio (studio/): `pnpm --filter @dialbrio/studio dev` → localhost:3333. */
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? "http://localhost:3333";

export const isSanityConfigured = projectId.length > 0;
