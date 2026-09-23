import { cn } from "@/lib/utils";

/** Monospace for phone numbers, IDs, timestamps and technical values only (docs/design.md §5). */
export function Mono({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("font-mono text-[0.92em] tabular-nums tracking-tight", className)}>{children}</span>;
}
