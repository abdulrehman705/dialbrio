import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "../env";

export const client = createClient({
  projectId: projectId || "missing",
  dataset,
  apiVersion,
  useCdn: true, // fast, cached reads of published content
  perspective: "published",
  stega: { studioUrl },
});
