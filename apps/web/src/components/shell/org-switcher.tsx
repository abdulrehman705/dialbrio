"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/lib/queries";
import { useShellStore } from "@/lib/stores/shell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Organization / sub-account switcher. Switching re-keys every tenant-scoped query. */
export function OrgSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { data: me, isLoading } = useMe();
  const subId = useShellStore((s) => s.subAccountId);
  const setSub = useShellStore((s) => s.setSubAccountId);
  const qc = useQueryClient();

  if (isLoading || !me) return <Skeleton className={collapsed ? "mx-auto size-10" : "h-11"} />;
  const active = me.subAccounts.find((s) => s.id === subId) ?? me.subAccounts[0]!;
  const letter = active.name[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Switch sub-account. Current: ${active.name}`}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-surface-hover data-[state=open]:bg-surface-hover",
          collapsed && "justify-center border-transparent bg-transparent p-0",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-fg font-display text-[14px] font-bold text-fg-inverse">{letter}</span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-fg">{active.name}</span>
              <span className="block truncate text-[11px] text-fg-muted">{me.organization.name}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-fg-muted" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{me.organization.name}</DropdownMenuLabel>
        {me.subAccounts.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onSelect={() => {
              if (s.id === subId) return;
              setSub(s.id);
              void qc.invalidateQueries();
              toast(`Switched to ${s.name}`, { description: "Data is now scoped to this sub-account." });
            }}
          >
            <span className="flex size-5 items-center justify-center rounded-sm bg-surface-active text-[10px] font-semibold text-fg-secondary">{s.name[0]}</span>
            <span className="flex-1 truncate">{s.name}</span>
            {s.id === active.id && <Check className="!text-brand" aria-label="Current" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Building2 /> Organization overview
          <span className="ml-auto text-[11px] text-fg-muted">Phase 7</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
