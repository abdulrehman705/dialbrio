import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRIAL_LINE } from "./home";
import { Container, Eyebrow, InkPanel } from "./primitives";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  cta?: boolean;
  children?: React.ReactNode;
}

/** Ink hero for secondary pages, inset like the brand documents. */
export function PageHero({ eyebrow, title, description, cta = true, children }: PageHeroProps) {
  return (
    <section className="bg-background px-3 pt-3 sm:px-4 sm:pt-4">
      <InkPanel className="mx-auto max-w-[1400px] py-16 md:py-20">
        <Container>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-[820px] text-balance font-display text-[40px] leading-[1.04] font-bold tracking-[-0.04em] md:text-[56px]">{title}</h1>
          <p className="mt-5 max-w-[640px] text-[17px] leading-[1.6] text-fg-secondary">{description}</p>
          {cta && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="primary" size="lg">
                <Link href="/get-started">
                  Start free trial <ArrowRight />
                </Link>
              </Button>
              <p className="font-mono text-xs text-fg-muted sm:ml-3">{TRIAL_LINE}</p>
            </div>
          )}
          {children}
        </Container>
      </InkPanel>
    </section>
  );
}
