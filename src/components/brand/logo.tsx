import { cn } from "@/lib/utils";

type MarkTone = "brand" | "mono" | "white";

interface LogoMarkProps {
  size?: number;
  /** Two thicker motion bars for 16–23px rendering (favicon, dense UI). Auto-enabled below 24px. */
  simplified?: boolean;
  tone?: MarkTone;
  className?: string;
  title?: string;
}

/**
 * DialBrio mark: a D whose counter is a speech bubble (conversation), led by stepped motion bars
 * (forward movement). See docs/design.md §2.
 */
export function LogoMark({ size = 32, simplified, tone = "brand", className, title }: LogoMarkProps) {
  const simple = simplified ?? size < 24;
  const fill = tone === "white" ? "#FFFFFF" : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={cn("shrink-0", tone === "brand" && "text-brand", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <g fill={fill}>
        <path
          fillRule="evenodd"
          d="M14 6h8a14 14 0 0 1 0 28h-8V6Zm5.25 5.25v18.5l3.4-3.75h0.1a7.5 7.5 0 0 0 0-14.75h-3.5Z"
        />
        {simple ? (
          <>
            <rect x="2" y="12" width="10" height="5" rx="2.5" />
            <rect x="6" y="21" width="6" height="5" rx="2.5" />
          </>
        ) : (
          <>
            <rect x="2.5" y="11.5" width="9.5" height="3.5" rx="1.75" />
            <rect x="5" y="18.25" width="7" height="3.5" rx="1.75" />
            <rect x="7.5" y="25" width="4.5" height="3.5" rx="1.75" />
          </>
        )}
      </g>
    </svg>
  );
}

interface LogoProps {
  variant?: "full" | "compact";
  className?: string;
  markSize?: number;
  tone?: MarkTone;
  /** Tagline under the wordmark (full variant only, marketing surfaces). */
  tagline?: boolean;
}

/** Horizontal logo: signal-green mark + single-colour wordmark in the display face. */
export function Logo({ variant = "compact", className, markSize, tone = "brand", tagline }: LogoProps) {
  const full = variant === "full";
  const size = markSize ?? (full ? 36 : 26);
  return (
    <span className={cn("inline-flex items-center", full ? "gap-2.5" : "gap-2", className)} aria-label="DialBrio">
      <LogoMark size={size} tone={tone} />
      <span className="flex flex-col leading-none" aria-hidden>
        <span className={cn("font-display font-extrabold tracking-[-0.035em]", full ? "text-[26px]" : "text-[18px]", tone === "white" ? "text-white" : "text-fg")}>
          DialBrio
        </span>
        {full && tagline && (
          <span className="mt-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-fg-muted">
            More conversations. Real growth.
          </span>
        )}
      </span>
    </span>
  );
}
