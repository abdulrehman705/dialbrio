"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Sheet, SheetContent } from "@/components/ui/dialog";
import { ConnectionBanner } from "@/components/states";
import { useConnectionState } from "@/lib/realtime/hooks";
import { useShellStore } from "@/lib/stores/shell";
import { CommandPalette } from "./command-palette";
import { Sidebar, SidebarNav } from "./sidebar";
import { OrgSwitcher } from "./org-switcher";
import { TopBar } from "./top-bar";

/** Application shell: top bar across, collapsible sidebar, independently scrolling workspace. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const mobileOpen = useShellStore((s) => s.mobileNavOpen);
  const setMobileOpen = useShellStore((s) => s.setMobileNavOpen);
  const pathname = usePathname();
  const conn = useConnectionState();

  React.useEffect(() => setMobileOpen(false), [pathname, setMobileOpen]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-sidebar">
      <a href="#main" className="sr-only z-[60] rounded-md bg-brand-solid px-3 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main id="main" tabIndex={-1} className="relative min-w-0 flex-1 overflow-y-auto bg-background outline-none lg:rounded-tl-xl lg:border-t lg:border-l lg:border-border">
          <ConnectionBanner state={conn} />
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" title="Navigation" hideHeader className="p-0">
          <div className="flex h-(--topbar-h) items-center border-b border-border px-4">
            <Logo />
          </div>
          <div className="p-3">
            <OrgSwitcher />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-6">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      <CommandPalette />
    </div>
  );
}
