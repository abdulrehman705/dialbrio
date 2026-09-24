import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import { POST_DETAIL_QUERY, POST_SLUGS_QUERY } from "@/sanity/queries";
import { Container } from "@/components/marketing/primitives";
import { RichText } from "@/components/marketing/portable-text";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Published content only, straight from the API (not the CDN).
  return client.withConfig({ useCdn: false }).fetch(POST_SLUGS_QUERY);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: post } = await sanityFetch({ query: POST_DETAIL_QUERY, params: await params, stega: false });
  if (!post) return {};
  return { title: post.seo?.title || post.title, description: post.seo?.description || post.excerpt || undefined };
}

export default async function PostPage({ params }: Props) {
  const { data: post } = await sanityFetch({ query: POST_DETAIL_QUERY, params: await params, stega: false });
  if (!post) notFound();

  return (
    <article className="bg-background pt-12 pb-24 md:pt-16">
      <Container className="max-w-[760px]">
        <Link href="/blog" className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-fg-secondary hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden /> All posts
        </Link>
        <p className="mt-6 font-mono text-[12px] text-fg-muted">
          {post.publishedAt ? format(new Date(post.publishedAt), "MMMM d, yyyy") : ""}
          {post.categories?.length ? ` · ${post.categories.filter(Boolean).join(", ")}` : ""}
        </p>
        <h1 className="mt-3 text-balance font-display text-[36px] leading-[1.05] font-bold tracking-[-0.035em] text-fg md:text-[48px]">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-[19px] leading-relaxed text-fg-secondary">{post.excerpt}</p>}
        {post.author?.name && (
          <p className="mt-6 text-[14px] text-fg">
            {post.author.name}
            {post.author.role && <span className="text-fg-muted"> · {post.author.role}</span>}
          </p>
        )}
        {post.coverImage?.asset && (
          <Image src={urlFor(post.coverImage).width(1520).height(855).url()} alt={post.coverImage.alt ?? ""} width={1520} height={855} priority className="mt-10 h-auto w-full rounded-2xl border border-border" />
        )}
        {post.body && <div className="mt-6"><RichText value={post.body} /></div>}
      </Container>
    </article>
  );
}
