import "server-only";
import { defineLive } from "next-sanity/live";
import { client } from "./client";

/**
 * Live Content API: `sanityFetch` serves cached content and `<SanityLive />` (rendered in the root
 * layout) revalidates it when documents change in the Studio. The read token is optional today
 * (published content only) and is only ever read on the server.
 */
const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});
