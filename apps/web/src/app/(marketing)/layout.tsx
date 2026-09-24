import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MotionStyles } from "@/components/marketing/motion";

/** Public site. Sections force their own theme (paper or ink), independent of the visitor's app theme. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="light flex min-h-dvh flex-col bg-background text-fg">
      <a href="#content" className="sr-only z-[60] rounded-md bg-brand-solid px-3 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <MotionStyles />
      <SiteHeader />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
