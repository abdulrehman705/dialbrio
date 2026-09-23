import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "./primitives";

const columns = [
  { title: "Product", links: [["Overview", "/product"], ["Dialer", "/dialer"], ["AI", "/ai"], ["Conversations", "/conversations"], ["Integrations", "/integrations"]] },
  { title: "Company", links: [["Pricing", "/pricing"], ["Security & compliance", "/security"], ["Start free trial", "/get-started"], ["Log in", "/login"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="dark bg-background text-fg">
      <Container className="grid gap-12 pt-16 pb-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="flex max-w-sm flex-col gap-4">
          <Logo markSize={26} />
          <p className="text-[14px] leading-6 text-fg-secondary">
            The power dialer for sales teams and agencies that live in GoHighLevel or HubSpot. Every feature, honestly priced.
          </p>
          <p className="font-mono text-xs text-fg-muted">14-day trial · 500 free minutes · no card</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-[13px] font-medium text-fg-muted">{col.title}</h2>
            <ul className="mt-3 flex flex-col">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="inline-flex min-h-9 items-center text-[14px] text-fg-secondary transition-colors hover:text-fg max-lg:min-h-11">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs leading-5 text-fg-muted md:flex-row md:justify-between">
        <p>© 2026 DialBrio. Pricing is the proposed launch price book (Sept 2026). Features marked planned are on the roadmap, not in the product yet.</p>
        <p className="shrink-0">GoHighLevel, HubSpot, Salesforce and Twilio are trademarks of their owners.</p>
      </Container>
    </footer>
  );
}
