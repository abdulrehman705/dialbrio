"use client";

import type { Integration } from "@dialbrio/types";
import { ChevronRight } from "lucide-react";
import { IntegrationStatus } from "@/components/domain";
import { cn, timeAgo } from "@/lib/utils";
import { actionLabel } from "./provider-meta";

/** One integration as a directory row: name and purpose left, account and state right. */
export function IntegrationRow({ integration, onOpen }: { integration: Integration; onOpen: () => void }) {
  const attention = integration.status === "needs_attention" || integration.status === "error";
  const action = actionLabel(integration.status);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${integration.name}: ${action}`}
      className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left transition-colors duration-(--duration-fast) hover:bg-surface-hover max-lg:min-h-11 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)_auto]"
    >
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] font-semibold text-fg">{integration.name}</span>
          {!integration.required && <span className="text-xs text-fg-muted">optional</span>}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-fg-muted">{integration.description}</p>
      </div>
      <div className="col-span-2 min-w-0 text-xs text-fg-muted max-md:order-last md:col-span-1">
        {integration.connectedAccount ? (
          <>
            <p className="truncate font-mono text-fg-secondary">{integration.connectedAccount}</p>
            {integration.lastSyncAt && <p className="mt-0.5">Synced {timeAgo(integration.lastSyncAt)}</p>}
          </>
        ) : (
          <p>{integration.status === "error" ? "Credentials rejected" : "Not set up"}</p>
        )}
      </div>
      <div className="flex items-center gap-3 justify-self-end">
        <IntegrationStatus status={integration.status} size="sm" />
        <span className={cn("hidden items-center gap-0.5 text-[13px] font-medium sm:inline-flex", attention ? "text-warning-text" : "text-fg-secondary group-hover:text-fg")}>
          {action}
          <ChevronRight className="size-4" aria-hidden />
        </span>
      </div>
    </button>
  );
}
