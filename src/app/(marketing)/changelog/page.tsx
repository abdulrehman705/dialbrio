import type { Metadata } from "next";
import { format } from "date-fns";
import { Container, Section } from "@/components/marketing/primitives";
import { PageHero } from "@/components/marketing/page-hero";
import { sanityFetch } from "@/sanity/lib/live";
import { CHANGELOG_QUERY } from "@/sanity/queries";

export const metadata: Metadata = { title: "Changelog", description: "What's new, improved and fixed in DialBrio." };

const KIND_LABEL: Record<string, string> = { new: "New", improved: "Improved", fixed: "Fixed" };

export default async function ChangelogPage() {
  const { data: entries } = await sanityFetch({ query: CHANGELOG_QUERY, stega: false });

  return (
    <>
      <PageHero eyebrow="Changelog" title="What shipped, and when." description="New features, improvements and fixes, newest first." cta={false} />
      <Section aria-label="Changelog entries">
        <Container className="max-w-[860px]">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong px-6 py-16 text-center">
              <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-fg">No entries yet</p>
              <p className="mx-auto mt-2 max-w-[440px] text-[15px] text-fg-secondary">Changelog entries published in the DialBrio Studio appear here automatically.</p>
            </div>
          ) : (
            <ol className="divide-y divide-border border-y border-border">
              {entries.map((e) => (
                <li key={e._id} className="grid gap-2 py-7 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                    <time dateTime={e.releasedAt ?? undefined} className="font-mono text-[12.5px] text-fg-muted">
                      {e.releasedAt ? format(new Date(e.releasedAt), "MMM d, yyyy") : ""}
                    </time>
                    {e.kind && <span className="rounded-full border border-border px-2 py-0.5 text-[11.5px] font-medium text-fg-secondary">{KIND_LABEL[e.kind] ?? e.kind}</span>}
                  </div>
                  <div>
                    <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-fg">{e.title}</h2>
                    {e.summary && <p className="mt-1.5 text-[15.5px] leading-relaxed text-fg-secondary">{e.summary}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </Section>
    </>
  );
}
