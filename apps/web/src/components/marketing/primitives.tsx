import * as React from "react";
import { cn } from "@/lib/utils";

/** Marketing container: wider rhythm than the app, 16px minimum gutters. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1160px] px-4 sm:px-6", className)}>{children}</div>;
}

interface SectionProps {
  /** Forces a theme for this section, independent of the visitor's theme. */
  tone?: "dark" | "light";
  /** Light sections sit on warm paper by default; `surface` switches to white. */
  surface?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
  "aria-labelledby"?: string;
}

export function Section({ tone = "light", surface, id, className, children, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={rest["aria-labelledby"]}
      className={cn(tone, "relative py-20 text-fg md:py-24", surface ? "bg-surface" : "bg-background", className)}
    >
      {children}
    </section>
  );
}

/** Ink panel inset from the page edges, like the brand documents. */
export function InkPanel({ className, children, as: As = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "section" }) {
  return <As className={cn("dark rounded-2xl bg-background text-fg", className)}>{children}</As>;
}

/** Mono section label: "01 · Dialing engine". */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, description, id, className, as: H = "h2" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-[720px]", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <H id={id} className="text-balance font-display text-[30px] leading-[1.08] font-bold tracking-[-0.035em] text-fg md:text-[38px]">
        {title}
      </H>
      {description && <p className="mt-3 max-w-[640px] text-[16.5px] leading-[1.6] text-fg-secondary">{description}</p>}
    </div>
  );
}

/** Mono spec chip, e.g. "4 lines · AMD < 1s". */
export function SpecChip({ children, tone = "brand", className }: { children: React.ReactNode; tone?: "brand" | "amber" | "neutral"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-[5px] px-2 py-1 font-mono text-xs font-medium leading-none",
        tone === "brand" && "bg-brand-soft text-brand-text",
        tone === "amber" && "border border-warning bg-warning-soft text-warning-text",
        tone === "neutral" && "bg-neutral-soft text-neutral-text",
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface Feature {
  title: string;
  body: React.ReactNode;
  spec?: string;
  /** Amber callout treatment for plan-gated or not-yet-shipped items. */
  callout?: boolean;
  status?: "planned";
}

/** PDF-style feature card: status dot, title, plain body, spec chip. */
export function FeatureCard({ f, className }: { f: Feature; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-6",
        f.callout ? "border-warning bg-warning-soft" : "border-border bg-surface",
        className,
      )}
    >
      <h3 className="flex items-center gap-2.5 text-[17px] leading-6 font-semibold tracking-[-0.01em] text-fg">
        <span className={cn("size-2 shrink-0 rounded-full ring-4", f.callout ? "bg-warning ring-warning-soft" : "bg-brand ring-brand-soft")} aria-hidden />
        {f.title}
      </h3>
      <p className="text-[14.5px] leading-[1.6] text-fg-secondary">{f.body}</p>
      {(f.spec || f.status) && (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {f.spec && <SpecChip tone={f.callout ? "amber" : "brand"}>{f.spec}</SpecChip>}
          {f.status === "planned" && <SpecChip tone="neutral">planned</SpecChip>}
        </div>
      )}
    </div>
  );
}

export function FeatureGrid({ items, className }: { items: Feature[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {items.map((f) => (
        <FeatureCard key={f.title} f={f} />
      ))}
    </div>
  );
}

/** A framed product surface ("screenshot") built from real components. */
export function ProductFrame({ className, children, label }: { className?: string; children: React.ReactNode; label: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-border bg-surface shadow-lg", className)}>
      <div role="img" aria-label={label}>
        <div inert className="select-none">
          {children}
        </div>
      </div>
    </figure>
  );
}

export function CheckList({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-6 text-fg-secondary">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered divider between PDF-style chapters. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-border", className)} />;
}
