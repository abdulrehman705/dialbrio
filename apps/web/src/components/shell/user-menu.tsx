"use client";

import { useTheme } from "next-themes";
import { ChevronsUpDown, Eye, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@dialbrio/types";
import { useMe } from "@/lib/queries";
import { useRole } from "@/lib/session";
import { useShellStore } from "@/lib/stores/shell";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_MODE } from "@/lib/api";
import { cn } from "@/lib/utils";

const roleLabel: Record<Role, string> = { admin: "Admin", manager: "Manager", agent: "Agent" };

export function UserMenu({ collapsed, compact }: { collapsed?: boolean; compact?: boolean }) {
  const { data: me } = useMe();
  const role = useRole();
  const { theme, setTheme } = useTheme();
  const previewRole = useShellStore((s) => s.previewRole);
  const setPreviewRole = useShellStore((s) => s.setPreviewRole);

  if (!me || !role) return <Skeleton className={collapsed || compact ? "size-8 rounded-full" : "h-10"} />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "flex items-center gap-2.5 rounded-md text-left transition-colors hover:bg-surface-hover data-[state=open]:bg-surface-hover",
          collapsed || compact ? "justify-center p-1" : "w-full p-1.5",
        )}
      >
        <Avatar name={me.user.name} initials={me.user.initials} size={compact ? "sm" : "md"} />
        {!collapsed && !compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-fg">{me.user.name}</span>
              <span className="block truncate text-[11px] text-fg-muted">
                {roleLabel[role]}
                {previewRole && " (preview)"}
              </span>
            </span>
            <ChevronsUpDown className="size-4 text-fg-muted" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? "end" : "start"} side={compact ? "bottom" : "top"} className="w-64">
        <div className="px-2 py-2">
          <p className="text-[13px] font-medium text-fg">{me.user.name}</p>
          <p className="text-xs text-fg-muted">{me.user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast("Profile settings arrive with authentication in Phase 1.")}>
          <UserRound /> Profile
        </DropdownMenuItem>
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">
            <Sun /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        {API_MODE === "mock" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-1.5">
              <Eye className="size-3" /> Demo · preview role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={previewRole ?? me.role} onValueChange={(v) => setPreviewRole(v === me.role ? null : (v as Role))}>
              {(["admin", "manager", "agent"] as Role[]).map((r) => (
                <DropdownMenuRadioItem key={r} value={r}>
                  {roleLabel[r]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => (window.location.href = "/login")}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
