import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page-header";

interface PlannedModuleProps {
  title: string;
  description: string;
  phase: string;
  /** Plain statement of what exists today and why this screen is empty. */
  intro: string;
  capabilities: { title: string; detail: string; spec?: string }[];
  related?: { label: string; href: string }[];
}

/**
 * Honest placeholder for modules scheduled in a later phase: what will live here and when.
 * Never simulates functionality that does not exist yet.
 */
export function PlannedModule({ title, description, phase, intro, capabilities, related }: PlannedModuleProps) {
  return (
    <Page>
      <PageHeader title={title} description={description} meta={<span className="font-mono text-xs text-fg-muted">planned · {phase}</span>} />
      <div className="grid gap-10 border-t border-border pt-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="text-[15px] leading-7 text-fg-secondary">{intro}</p>
          {related && related.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-fg">Available today</p>
              <ul className="mt-2 flex flex-col">
                {related.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="group flex items-center justify-between gap-3 border-b border-border py-2.5 text-[13px] text-fg-secondary hover:text-fg max-lg:min-h-11"
                    >
                      {r.label}
                      <ArrowRight className="size-4 text-fg-muted transition-transform duration-(--duration-fast) group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <ol className="flex flex-col divide-y divide-border">
          {capabilities.map((c, i) => (
            <li key={c.title} className="grid grid-cols-[2.25rem_1fr] gap-x-3 py-5 first:pt-0">
              <span className="font-mono text-xs font-semibold text-brand-text">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-display text-[17px] font-bold tracking-[-0.02em] text-fg">{c.title}</h2>
                <p className="mt-1 max-w-xl text-[13.5px] leading-6 text-fg-muted">{c.detail}</p>
                {c.spec && <span className="mt-2.5 inline-block rounded-[5px] bg-brand-soft px-2 py-1 font-mono text-xs text-brand-text">{c.spec}</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}
