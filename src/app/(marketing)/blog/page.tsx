import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Container, Section } from "@/components/marketing/primitives";
import { PageHero } from "@/components/marketing/page-hero";
import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import { POSTS_INDEX_QUERY } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on outbound sales, speed-to-lead, number health and running calling for clients.",
};

export default async function BlogPage() {
  const { data: posts } = await sanityFetch({ query: POSTS_INDEX_QUERY, stega: false });

  return (
    <>
      <PageHero eyebrow="Blog" title="Notes from the phone floor." description="Outbound sales, speed-to-lead, number health and agency operations, written by the people building DialBrio." cta={false} />
      <Section aria-label="Posts">
        <Container>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong px-6 py-16 text-center">
              <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-fg">No posts yet</p>
              <p className="mx-auto mt-2 max-w-[440px] text-[15px] text-fg-secondary">Posts published in the DialBrio Studio appear here automatically.</p>
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p._id}>
                  <Link href={`/blog/${p.slug}`} className="group block rounded-xl">
                    <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border bg-surface-sunken">
                      {p.coverImage?.asset ? (
                        <Image src={urlFor(p.coverImage).width(900).height(506).url()} alt={p.coverImage.alt ?? ""} width={900} height={506} className="size-full object-cover transition-transform duration-(--duration-slow) group-hover:scale-[1.02]" />
                      ) : null}
                    </div>
                    <p className="mt-4 font-mono text-[12px] text-fg-muted">
                      {p.publishedAt ? format(new Date(p.publishedAt), "MMM d, yyyy") : ""}
                      {p.categories?.length ? ` · ${p.categories.filter(Boolean).join(", ")}` : ""}
                    </p>
                    <h2 className="mt-1.5 font-display text-[21px] leading-snug font-bold tracking-[-0.02em] text-fg group-hover:underline group-hover:underline-offset-4">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-fg-secondary">{p.excerpt}</p>}
                    {p.author?.name && <p className="mt-3 text-[13px] text-fg-muted">{p.author.name}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
