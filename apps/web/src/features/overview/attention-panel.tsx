"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AlertSeverity, AttentionItem } from "@dialbrio/types";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { cn, timeAgo } from "@/lib/utils";

const SEVERITY: Record<AlertSeverity, { label: string; icon: typeof Info; tone: "danger" | "warning" | "info"; text: string }> = {
  critical: { label: "Critical", icon: CircleAlert, tone: "danger", text: "text-danger-text" },
  warning: { label: "Warning", icon: TriangleAlert, tone: "warning", text: "text-warning-text" },
  info: { label: "Info", icon: Info, tone: "info", text: "text-info-text" },
};

export function AttentionPanel({ items, loading, error, onRetry, className }: { items?: AttentionItem[]; loading: boolean; error: boolean; onRetry: () => void; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const urgent = items?.filter((i) => i.severity !== "info").length ?? 0;
  const order = { critical: 0, warning: 1, info: 2 };
  const sorted = [...(items ?? [])].sort((a, b) => order[a.severity] - order[b.severity]);
  const LIMIT = 4;
  const visible = expanded ? sorted : sorted.slice(0, LIMIT);
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        title="Needs attention"
        description={items?.length ? (urgent ? `${urgent} of ${items.length} are affecting calls right now` : `${items.length} notices, nothing urgent`) : "Failures and risks that affect calling"}
      />
      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="space-y-3 px-5 pb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : error ? (
          <ErrorState compact onRetry={onRetry} description="Alerts could not be loaded." />
        ) : !items?.length ? (
          <EmptyState compact icon={CircleCheck} title="Nothing needs attention" description="Integrations, numbers and queues are healthy." />
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {visible.map((item) => {
              const s = SEVERITY[item.severity];
              const Icon = s.icon;
              return (
                <li key={item.id} className={cn("flex gap-3 px-5 py-3", item.severity === "critical" && "bg-danger-soft/40")}>
                  <Icon className={cn("mt-0.5 size-4 shrink-0", s.text)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] font-medium text-fg">
                        <span className="sr-only">{s.label}: </span>
                        {item.title}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] text-fg-muted">{timeAgo(item.at)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-fg-muted">{item.detail}</p>
                    {item.action && (
                      <Link href={item.action.href} className="mt-1 inline-flex min-h-6 items-center gap-1 text-[13px] font-medium text-brand-text underline-offset-4 hover:underline max-lg:min-h-11">
                        {item.action.label} <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {sorted.length > LIMIT && (
          <div className="border-t border-border px-3 py-2">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="w-full">
              <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
              {expanded ? "Show fewer" : `Show ${sorted.length - LIMIT} more`}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
