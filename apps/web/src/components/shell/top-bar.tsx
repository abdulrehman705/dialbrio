"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Menu, Search } from "lucide-react";
import { navItemFor } from "@/lib/nav";
import { useMe } from "@/lib/queries";
import { useShellStore } from "@/lib/stores/shell";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SyncIndicator } from "./sync-indicator";
import { Notifications } from "./notifications";
import { UserMenu } from "./user-menu";

export function TopBar() {
  const pathname = usePathname();
  const item = navItemFor(pathname);
  const { data: me } = useMe();
  const subId = useShellStore((s) => s.subAccountId);
  const collapsed = useShellStore((s) => s.sidebarCollapsed);
  const openCommand = useShellStore((s) => s.setCommandOpen);
  const openMobileNav = useShellStore((s) => s.setMobileNavOpen);
  const sub = me?.subAccounts.find((s) => s.id === subId);

  return (
    <header className="flex h-(--topbar-h) shrink-0 items-center bg-sidebar max-lg:border-b max-lg:border-border">
      {/* Brand area aligned with the sidebar */}
      <div
        className={cn(
          "hidden h-full shrink-0 items-center transition-[width] duration-(--duration-slow) ease-out lg:flex",
          collapsed ? "w-(--sidebar-w-collapsed) justify-center" : "w-(--sidebar-w) px-4",
        )}
      >
        <Link href="/app" aria-label="DialBrio home" className="rounded-md">
          {collapsed ? <LogoMark size={26} /> : <Logo />}
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 md:gap-3 md:px-5">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => openMobileNav(true)}>
          <Menu />
        </Button>
        <Link href="/app" aria-label="DialBrio home" className="lg:hidden">
          <LogoMark size={24} />
        </Link>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] sm:flex">
          <span className="truncate text-fg-muted">{sub?.name ?? " "}</span>
          <span className="text-fg-muted" aria-hidden>
            /
          </span>
          <span className="truncate font-medium text-fg">{item?.label ?? ""}</span>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={() => openCommand(true)}
            className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface pr-1.5 pl-2.5 text-[13px] text-fg-muted transition-colors hover:border-border-strong hover:text-fg-secondary max-md:size-10 max-md:justify-center max-md:p-0 md:w-64 xl:w-80"
            aria-label="Search and commands"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <span className="flex-1 text-left max-md:hidden">Search contacts, campaigns…</span>
            <Kbd className="max-md:hidden">⌘K</Kbd>
          </button>
          <SyncIndicator />
          <Notifications />
          <Tooltip content="Help & shortcuts">
            <Button variant="ghost" size="icon-sm" aria-label="Help and keyboard shortcuts" className="max-sm:hidden" onClick={() => openCommand(true)}>
              <CircleHelp className="size-[18px]" />
            </Button>
          </Tooltip>
          <div className="lg:hidden">
            <UserMenu compact />
          </div>
        </div>
      </div>
    </header>
  );
}
