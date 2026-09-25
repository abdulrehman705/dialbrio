import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { InkPanel } from "./primitives";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const waitlistPoints = [
  ["Early access", "we open to teams in batches"],
  ["14 days", "free trial when your workspace opens"],
  ["500 minutes", "free, on your own leads"],
];

/** Split layout for the waitlist: inset ink panel beside a paper form. */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="light grid min-h-dvh bg-background text-fg lg:grid-cols-[1fr_minmax(480px,560px)]">
      <div className="hidden p-4 lg:block">
        <InkPanel className="flex h-full flex-col justify-between p-10">
          <Link href="/" aria-label="DialBrio home" className="self-start rounded-md">
            <Logo markSize={28} />
          </Link>
          <div className="max-w-md">
            <p className="eyebrow">Waitlist</p>
            <p className="mt-4 font-display text-[36px] leading-[1.08] font-bold tracking-[-0.035em]">See it dial your own list.</p>
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {waitlistPoints.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="font-display text-[22px] font-bold tracking-[-0.02em] text-brand-text">{k}</dt>
                  <dd className="text-right text-[14px] text-fg-secondary">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="font-mono text-xs text-fg-muted">© 2026 DialBrio</p>
        </InkPanel>
      </div>

      <main className="flex flex-col px-4 py-8 sm:px-10">
        <Link href="/" aria-label="DialBrio home" className="self-start rounded-md lg:hidden">
          <Logo markSize={26} />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-[32px] leading-9 font-bold tracking-[-0.035em] text-fg">{title}</h1>
          <p className="mt-2 text-[15px] text-fg-secondary">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-[13px] text-fg-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
