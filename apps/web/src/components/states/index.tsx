import * as React from "react";
import Link from "next/link";
import { CircleAlert, Lock, Plug, RefreshCw, WifiOff, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

/** Every empty region explains itself and offers the next step. Never an empty white box. */
export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14", className)}>
      <span className={cn("flex items-center justify-center rounded-full bg-surface-sunken text-fg-muted", compact ? "size-9" : "size-11")}>
        <Icon className={compact ? "size-4" : "size-5"} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-fg">{title}</p>
        {description && <p className="mt-1 text-[13px] leading-5 text-fg-muted">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, onRetry, className, compact }: { title?: string; description?: string; onRetry?: () => void; className?: string; compact?: boolean }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-3 text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      <span className="flex size-10 items-center justify-center rounded-lg bg-danger-soft text-danger-text">
        <CircleAlert className="size-5" aria-hidden />
      </span>
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-fg">{title}</p>
        <p className="mt-1 text-[13px] text-fg-muted">{description ?? "The data could not be loaded. Your work is safe — try again."}</p>
      </div>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          <RefreshCw /> Retry
        </Button>
      )}
    </div>
  );
}

export function PermissionState({ area, className }: { area: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      icon={Lock}
      title={`You don't have access to ${area}`}
      description="Your role doesn't include this area. Ask an admin in your organization if you need access."
    />
  );
}

export function IntegrationRequired({ provider, reason, className }: { provider: string; reason: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      icon={Plug}
      title={`Connect ${provider} to continue`}
      description={reason}
      action={
        <Button asChild variant="primary" size="sm">
          <Link href="/app/integrations">Open integrations</Link>
        </Button>
      }
    />
  );
}

/** Banner for live surfaces when the realtime connection drops. */
export function ConnectionBanner({ state }: { state: "online" | "reconnecting" | "offline" }) {
  if (state === "online") return null;
  return (
    <div role="status" className="flex items-center gap-2 border-b border-border bg-warning-soft px-4 py-2 text-[13px] text-warning-text">
      <WifiOff className="size-4" aria-hidden />
      {state === "reconnecting" ? "Reconnecting to live updates… Calls in progress are not affected." : "You are offline. Changes will sync when the connection returns."}
    </div>
  );
}
