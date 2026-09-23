"use client";

import Link from "next/link";
import { useState } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { useIntegrations } from "@/lib/queries";
import { useConnectionState, useRealtimeEvent } from "@/lib/realtime/hooks";
import { StatusDot } from "@/components/ui/status-dot";
import { Tooltip } from "@/components/ui/tooltip";
import { cn, timeAgo } from "@/lib/utils";

/** Live CRM sync + realtime connection indicator. Reflects real integration health, not decoration. */
export function SyncIndicator() {
  const { data } = useIntegrations();
  const conn = useConnectionState();
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  useRealtimeEvent("sync.status", (e) => setLastEvent(e.at));

  const ghl = data?.find((i) => i.provider === "ghl");
  const issue = ghl && (ghl.status === "needs_attention" || ghl.status === "error");
  const offline = conn !== "online";
  const last = lastEvent ?? ghl?.lastSyncAt;

  const label = offline ? "Reconnecting" : issue ? "Sync issues" : "Live";
  const detail = offline
    ? "Live updates paused. Reconnecting…"
    : issue
      ? `GoHighLevel: ${ghl.checks.find((c) => c.status !== "ok")?.detail ?? "needs attention"}`
      : `GoHighLevel synced${last ? ` ${timeAgo(last)}` : ""} · realtime connected`;

  return (
    <Tooltip content={detail} className="max-w-72">
      <Link
        href="/app/integrations"
        className={cn(
          "hidden h-8 items-center gap-2 rounded-md px-2.5 text-xs font-medium transition-colors hover:bg-surface-hover sm:inline-flex",
          issue || offline ? "text-warning-text" : "text-fg-secondary",
        )}
        aria-label={`Sync status: ${label}. ${detail}`}
      >
        {offline ? <RefreshCw className="size-3.5 animate-spin" /> : issue ? <TriangleAlert className="size-3.5" /> : <StatusDot tone="success" live size="md" />}
        <span className="max-xl:hidden">{label}</span>
      </Link>
    </Tooltip>
  );
}
