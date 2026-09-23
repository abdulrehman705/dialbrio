"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { can } from "@dialbrio/types";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV, navItemFor, type NavItem } from "@/lib/nav";
import { useRole } from "@/lib/session";
import { useShellStore } from "@/lib/stores/shell";
import { Tooltip } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";

function NavLink({ item, active, collapsed, onNavigate }: { item: NavItem; active: boolean; collapsed: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-(--duration-fast) max-lg:h-11",
        active ? "bg-surface text-fg shadow-sm" : "text-fg-secondary hover:bg-surface-hover hover:text-fg",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className={cn("size-[18px] shrink-0", active ? "text-brand" : "text-fg-muted group-hover:text-fg-secondary")} strokeWidth={1.9} aria-hidden />
      <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
    </Link>
  );
  return collapsed ? (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

/** Role-filtered navigation. Inaccessible items are hidden, not disabled (docs/design.md §13). */
export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = useRole();
  const activeItem = navItemFor(pathname);

  if (!role) {
    return (
      <div className="flex flex-col gap-2 px-3 py-2" aria-busy>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-7" />
        ))}
      </div>
    );
  }

  return (
    <nav aria-label="Main" className="flex flex-col gap-4 px-3 py-2">
      {NAV.map((group, gi) => {
        const items = group.items.filter((i) => can(role, i.permission));
        if (!items.length) return null;
        return (
          <div key={gi} className="flex flex-col gap-0.5">
            {group.label &&
              (collapsed ? (
                <div className="mx-auto mb-1 h-px w-6 bg-border" aria-hidden />
              ) : (
                <div className="px-2.5 pb-1 text-xs font-medium text-fg-muted">{group.label}</div>
              ))}
            {items.map((item) => (
              <NavLink key={item.href} item={item} active={activeItem?.href === item.href} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const collapsed = useShellStore((s) => s.sidebarCollapsed);
  const toggle = useShellStore((s) => s.toggleSidebar);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "hidden shrink-0 flex-col bg-sidebar transition-[width] duration-(--duration-slow) ease-out lg:flex",
        collapsed ? "w-(--sidebar-w-collapsed)" : "w-(--sidebar-w)",
      )}
    >
      <div className={cn("p-3", collapsed && "px-2")}>
        <OrgSwitcher collapsed={collapsed} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-3">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className={cn("flex flex-col gap-1 p-3", collapsed && "items-center px-2")}>
        <UserMenu collapsed={collapsed} />
        <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right" shortcut={<Kbd>⌘\</Kbd>}>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn("flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-fg-muted hover:bg-surface-hover hover:text-fg", collapsed && "justify-center px-0 w-8")}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && "Collapse"}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
