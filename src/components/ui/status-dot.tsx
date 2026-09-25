import { cn } from "@/lib/utils";

const tones = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  brand: "bg-brand",
  info: "bg-info",
  neutral: "bg-fg-muted",
  ringing: "bg-call-ringing",
  connected: "bg-call-connected",
  wrap: "bg-call-wrap",
  ai: "bg-ai",
} as const;

export type StatusDotTone = keyof typeof tones;

/** 6–8px status dot. `live` pulses (respecting reduced motion). Always pair with a text label. */
export function StatusDot({ tone = "neutral", live, className, size = "sm" }: { tone?: StatusDotTone; live?: boolean; className?: string; size?: "sm" | "md" }) {
  return (
    <span className={cn("relative inline-flex shrink-0", size === "sm" ? "size-1.5" : "size-2", className)} aria-hidden>
      {live && <span className={cn("absolute inset-0 rounded-full animate-ring-pulse", tones[tone])} />}
      <span className={cn("relative inline-flex size-full rounded-full", tones[tone])} />
    </span>
  );
}
