"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/dialog";
import { APP_LOGIN_URL } from "@/lib/links";
import { cn } from "@/lib/utils";
import { MARKETING_NAV } from "./nav";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="light sticky top-0 z-40 border-b border-border bg-background text-fg">
      <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center gap-8 px-4 sm:px-6">
        <Link href="/" aria-label="DialBrio home" className="rounded-md">
          <Logo markSize={26} />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {MARKETING_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-2 text-[14px] transition-colors duration-(--duration-fast)",
                  active ? "font-medium text-fg" : "text-fg-secondary hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {APP_LOGIN_URL && (
            <Button asChild variant="ghost" size="sm" className="max-sm:hidden">
              <a href={APP_LOGIN_URL}>Log in</a>
            </Button>
          )}
          <Button asChild variant="primary" size="sm" className="max-sm:hidden">
            <Link href="/waitlist">Join waitlist</Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" title="Menu" className="light max-w-sm bg-background text-fg">
          <nav aria-label="Mobile" className="flex flex-col p-3">
            {MARKETING_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="flex h-12 items-center border-b border-border px-2 text-[16px] font-medium text-fg last:border-b-0"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
            <Button asChild variant="primary" size="lg">
              <Link href="/waitlist">Join waitlist</Link>
            </Button>
            {APP_LOGIN_URL && (
              <Button asChild variant="secondary" size="lg">
                <a href={APP_LOGIN_URL}>Log in</a>
              </Button>
            )}
            <p className="pt-1 text-center font-mono text-xs text-fg-muted">14 days · 500 free minutes · no card</p>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
