import Image from "next/image";
import { PortableText, type PortableTextComponents, type PortableTextBlock } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import type { BlockContent } from "@/sanity/sanity.types";

type PtImage = { asset?: { _ref?: string }; alt?: string; caption?: string };

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mt-10 font-display text-[26px] leading-tight font-bold tracking-[-0.025em] text-fg">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 text-[19px] font-semibold text-fg">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 border-fg pl-5 text-[18px] leading-relaxed text-fg">{children}</blockquote>,
    normal: ({ children }) => <p className="mt-5 text-[17px] leading-[1.7] text-fg-secondary">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 text-[17px] leading-[1.7] text-fg-secondary">{children}</ul>,
    number: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-[17px] leading-[1.7] text-fg-secondary">{children}</ol>,
  },
  marks: {
    code: ({ children }) => <code className="rounded-[4px] bg-surface-sunken px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
    link: ({ value, children }) => {
      const href = (value as { href?: string })?.href ?? "#";
      const external = /^https?:/.test(href);
      return (
        <a href={href} className="text-fg underline underline-offset-4" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const img = value as PtImage;
      if (!img?.asset?._ref) return null;
      return (
        <figure className="mt-8">
          <Image src={urlFor(img).width(1400).url()} alt={img.alt ?? ""} width={1400} height={788} className="h-auto w-full rounded-xl border border-border" />
          {img.caption && <figcaption className="mt-2 text-[13px] text-fg-muted">{img.caption}</figcaption>}
        </figure>
      );
    },
  },
};

/**
 * Renders Sanity rich text (blockContent) in the Mono marketing style.
 * TypeGen marks span `children` optional while PortableText requires it; the renderer tolerates both.
 */
export function RichText({ value }: { value: BlockContent }) {
  return <PortableText value={value as PortableTextBlock[]} components={components} />;
}
