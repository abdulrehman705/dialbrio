import { Info } from "lucide-react";

/** Subtle notice that sign-in is a demo until authentication ships (Phase 1). */
export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-2 rounded-md border border-border bg-surface-sunken px-3 py-2.5 text-xs leading-5 text-fg-muted">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
