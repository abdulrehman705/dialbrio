"use client";

import Link from "next/link";
import { Bell, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { useOverview } from "@/lib/queries";
import { useCan } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states";
import { cn, timeAgo } from "@/lib/utils";

const sevIcon = { critical: CircleAlert, warning: TriangleAlert, info: Info };
const sevTone = { critical: "text-danger-text", warning: "text-warning-text", info: "text-info-text" };

export function Notifications() {
  const canSeeOps = useCan("queue.manage");
  const { data, isLoading } = useOverview("today");
  const items = canSeeOps ? (data?.attention ?? []) : [];
  const urgent = items.filter((i) => i.severity !== "info").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Notifications${urgent ? `, ${urgent} need attention` : ""}`} className="relative">
          <Bell className="size-[18px]" />
          {urgent > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-surface" aria-hidden />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(92vw,380px)] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-fg">Notifications</p>
          {urgent > 0 && <span className="text-xs text-fg-muted">{urgent} need attention</span>}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState compact icon={Bell} title="You're all caught up" description="Sync failures, number health changes and queue alerts will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Icon = sevIcon[n.severity];
                return (
                  <li key={n.id}>
                    <PopoverClose asChild>
                      <Link href={n.action?.href ?? "/app"} className="flex gap-3 px-4 py-3 hover:bg-surface-hover">
                        <Icon className={cn("mt-0.5 size-4 shrink-0", sevTone[n.severity])} aria-label={n.severity} />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium text-fg">{n.title}</span>
                          <span className="mt-0.5 block text-xs text-fg-muted">{timeAgo(n.at)}</span>
                        </span>
                      </Link>
                    </PopoverClose>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
