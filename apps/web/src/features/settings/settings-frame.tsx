"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { can, type SettingsSection } from "@dialbrio/types";
import { useRole } from "@/lib/session";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionState } from "@/components/states";
import { cn } from "@/lib/utils";
import { SETTINGS_SECTIONS_CONFIG } from "./section-config";

/** Settings layout: section list on the left (select on mobile), one section per page. */
export function SettingsFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useRole();
  const current = pathname.split("/")[3] as SettingsSection | undefined;

  const visible = role ? SETTINGS_SECTIONS_CONFIG.filter((s) => can(role, s.view)) : [];
  const active = SETTINGS_SECTIONS_CONFIG.find((s) => s.id === current);
  const allowed = role && active ? can(role, active.view) : undefined;

  // /app/settings has no section: render the page so its server redirect to /general can run.
  if (!current) return <>{children}</>;

  return (
    <Page>
      <PageHeader title="Settings" description="Configuration for this sub-account. Changes are audited." />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:hidden">
          {role ? (
            <Select
              aria-label="Settings section"
              value={current}
              onValueChange={(v) => router.push(`/app/settings/${v}`)}
              options={visible.map((s) => ({ value: s.id, label: s.label }))}
            />
          ) : (
            <Skeleton className="h-11" />
          )}
        </div>
        <nav aria-label="Settings sections" className="sticky top-6 hidden w-48 shrink-0 flex-col gap-0.5 lg:flex">
          {!role
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8" />)
            : visible.map((s) => {
                const on = s.id === current;
                return (
                  <Link
                    key={s.id}
                    href={`/app/settings/${s.id}`}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center rounded-md px-2.5 text-[13px] transition-colors",
                      on ? "bg-surface font-medium text-fg shadow-sm" : "text-fg-secondary hover:bg-surface-hover hover:text-fg",
                    )}
                  >
                    {s.label}
                  </Link>
                );
              })}
        </nav>
        <div className="min-w-0 max-w-3xl flex-1">
          {allowed === undefined ? (
            <Skeleton className="h-64" />
          ) : !allowed || !active ? (
            <PermissionState area={`${active?.label ?? "these"} settings`} />
          ) : (
            <>
              <div className="mb-4">
                <h2 className="font-display text-[22px] font-bold tracking-[-0.025em] text-fg">{active.label}</h2>
                <p className="mt-0.5 text-[13px] text-fg-muted">{active.description}</p>
              </div>
              {children}
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
