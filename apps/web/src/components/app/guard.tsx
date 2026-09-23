"use client";

import type { Permission } from "@dialbrio/types";
import { useCan } from "@/lib/session";
import { PermissionState } from "@/components/states";
import { Page } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Hides a screen from roles without access. UI-only convenience: the API enforces the same
 * permission map (packages/types/src/permissions.ts) on every request.
 */
export function Guard({ permission, area, children }: { permission: Permission; area: string; children: React.ReactNode }) {
  const allowed = useCan(permission);
  if (allowed === undefined)
    return (
      <Page>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64" />
      </Page>
    );
  if (!allowed)
    return (
      <Page>
        <PermissionState area={area} className="mt-10" />
      </Page>
    );
  return <>{children}</>;
}
