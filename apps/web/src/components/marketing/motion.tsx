"use client";

/**
 * Reduced-motion-aware wrappers around the vendored React Bits components (components/reactbits).
 * Rules (docs/design.md §10): motion is subtle and one-shot, content is always in the DOM, and people who
 * prefer reduced motion get the final state immediately. The GSAP-based components don't check
 * `prefers-reduced-motion` themselves, so every wrapper does.
 */

import * as React from "react";
import { useReducedMotion } from "motion/react";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import CountUp from "@/components/reactbits/CountUp";
import LogoLoop from "@/components/reactbits/LogoLoop";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import SplitText from "@/components/reactbits/SplitText";
import TextType from "@/components/reactbits/TextType";
import { cn } from "@/lib/utils";

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

/** True only after hydration and only when the visitor asked for less motion (keeps SSR markup stable). */
function useReduced() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  return mounted && !!reduce;
}

/**
 * Safety net for the hidden initial states that GSAP animates from. Without JavaScript (noscript) the content
 * shows immediately; if a script fails, it shows after a short delay instead of staying hidden.
 */
export function MotionStyles() {
  return (
    <>
      <style>{`
.rb-split{visibility:hidden;animation:rb-show 0s linear 2.5s forwards}
.rb-split:has(.split-word){visibility:visible;animation:none}
.rb-reveal{animation:rb-show 0s linear 3s forwards}
@keyframes rb-show{to{visibility:visible}}
@media (prefers-reduced-motion:reduce){.rb-split,.rb-reveal{visibility:visible!important;animation:none!important}}
`}</style>
      <noscript>
        <style>{`.rb-split,.rb-reveal{visibility:visible!important;animation:none!important}`}</style>
      </noscript>
    </>
  );
}

/* ── Headline: words rise in on load ─────────────────────────────────── */

interface RevealHeadingProps {
  text: string;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}

export function RevealHeading({ text, as: Tag = "h1", className, id }: RevealHeadingProps) {
  const reduced = useReduced();
  if (reduced)
    return (
      <Tag id={id} className={className}>
        {text}
      </Tag>
    );
  return (
    <SplitText
      text={text}
      tag={Tag}
      splitType="words"
      delay={40}
      duration={0.6}
      ease="power3.out"
      from={{ opacity: 0, y: 28 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0}
      rootMargin="0px"
      textAlign="left"
      // pb keeps descenders ("g") clear of SplitText's overflow mask at tight leading.
      className={cn("rb-split pb-[0.08em]", className)}
    />
  );
}

/* ── Section / block entrance ─────────────────────────────────────────── */

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use small steps (≤ 0.3s total) for staggered lists. */
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduced = useReduced();
  // min-w-0: the wrapper often becomes the grid/flex item, so it must not let wide children (tables) stretch the track.
  if (reduced) return <div className={cn("min-w-0", className)}>{children}</div>;
  return (
    <AnimatedContent distance={24} duration={0.6} ease="power3.out" threshold={0.12} delay={delay} className={cn("rb-reveal min-w-0", className)}>
      {children}
    </AnimatedContent>
  );
}

/* ── Counting number ──────────────────────────────────────────────────── */

/**
 * Counts up once when scrolled into view. An invisible copy of the final value reserves the width so nothing
 * shifts; screen readers only ever get the final value.
 */
export function CountNumber({ value, className, duration = 1.2 }: { value: number; className?: string; duration?: number }) {
  const mounted = useMounted();
  const reduced = useReduced();
  const final = new Intl.NumberFormat("en-US").format(value);
  if (!mounted || reduced) return <span className={className}>{final}</span>;
  return (
    <span className={cn("inline-grid", className)}>
      <span aria-hidden className="invisible [grid-area:1/1]">
        {final}
      </span>
      <span aria-hidden className="[grid-area:1/1]">
        <CountUp to={value} duration={duration} separator="," />
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

/* ── Typed line (live transcript) ─────────────────────────────────────── */

export function TypedLine({ text, delayMs = 0, className }: { text: string; delayMs?: number; className?: string }) {
  const mounted = useMounted();
  const reduced = useReduced();
  if (!mounted || reduced) return <span className={className}>{text}</span>;
  return (
    <span className={cn("inline-grid", className)}>
      {/* Reserves the final height so the transcript doesn't grow while typing. */}
      <span aria-hidden className="invisible inline-block whitespace-pre-wrap tracking-tight [grid-area:1/1]">
        {text}
        <span className="ml-1">|</span>
      </span>
      <span aria-hidden className="[grid-area:1/1]">
        <TextType as="span" text={text} loop={false} initialDelay={delayMs} typingSpeed={26} cursorCharacter="|" cursorClassName="text-brand" />
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/* ── Scroll-driven statement ──────────────────────────────────────────── */

export function RevealStatement({ text, className }: { text: string; className?: string }) {
  const reduced = useReduced();
  const textClass = "font-display text-[clamp(1.3rem,2.1vw,1.7rem)]! leading-[1.3]! font-semibold! tracking-[-0.02em] text-fg-secondary";
  if (reduced)
    return (
      <div className={cn("my-5", className)}>
        <p className={textClass}>{text}</p>
      </div>
    );
  return (
    <ScrollReveal baseOpacity={0.18} baseRotation={0} blurStrength={3} containerClassName={className} textClassName={textClass}>
      {text}
    </ScrollReveal>
  );
}

/* ── Name strip marquee ───────────────────────────────────────────────── */

interface MarqueeProps {
  items: { key: string; node: React.ReactNode; label: string }[];
  /** Rendered instead of the loop for reduced motion (e.g. a wrapped list). */
  fallback: React.ReactNode;
  label: string;
  className?: string;
}

export function Marquee({ items, fallback, label, className }: MarqueeProps) {
  const reduced = useReduced();
  if (reduced) return <>{fallback}</>;
  return (
    // contain:inline-size stops the loop's track from widening its grid/flex parent, which would make
    // LogoLoop add more copies to fill the wider parent, and so on.
    <div className="w-full min-w-0 [contain:inline-size]">
      <LogoLoop
        logos={items.map((i) => ({ node: i.node, title: i.label, ariaLabel: i.label }))}
        speed={40}
        gap={10}
        logoHeight={14}
        pauseOnHover
        fadeOut
        ariaLabel={label}
        className={className}
      />
    </div>
  );
}
