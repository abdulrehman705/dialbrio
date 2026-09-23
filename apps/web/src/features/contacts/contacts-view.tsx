"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Contact as ContactIcon, Download, Megaphone, UserRoundCog, X } from "lucide-react";
import type { RowSelectionState } from "@tanstack/react-table";
import type { Contact } from "@dialbrio/types";
import { useContacts } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Mono } from "@/components/ui/mono";
import { LeadStateBadge } from "@/components/domain";
import { EmptyState, ErrorState } from "@/components/states";
import { formatNumber, formatPhone, initials, timeAgo } from "@/lib/utils";
import { ContactsToolbar, EMPTY_FILTERS, type ContactFilters } from "./contacts-toolbar";
import { ContactDrawer } from "./contact-drawer";
import { NextActionLabel } from "./shared";

const PAGE_SIZE = 25;

const columns: ColumnDef<Contact, unknown>[] = [
  {
    id: "select",
    size: 40,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all on this page"
        checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? "indeterminate" : false}
        onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <span onClick={(e) => e.stopPropagation()} className="inline-flex">
        <Checkbox aria-label={`Select ${row.original.firstName} ${row.original.lastName}`} checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
      </span>
    ),
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (c) => `${c.firstName} ${c.lastName}`,
    cell: ({ row }) => {
      const c = row.original;
      const name = `${c.firstName} ${c.lastName}`;
      return (
        <span className="flex flex-col leading-tight">
          <span className="font-medium text-fg">{name}</span>
          <span className="text-xs text-fg-muted">
            {c.city}, {c.state}
          </span>
        </span>
      );
    },
  },
  { id: "phone", header: "Phone", accessorKey: "phone", enableSorting: false, cell: ({ row }) => <Mono className="text-fg-secondary">{formatPhone(row.original.phone)}</Mono> },
  { id: "email", header: "Email", accessorKey: "email", meta: { className: "max-2xl:hidden" }, cell: ({ row }) => row.original.email ?? <span className="text-fg-muted">—</span> },
  { id: "source", header: "Source", accessorKey: "source", meta: { className: "max-2xl:hidden" } },
  { id: "lifecycle", header: "Lifecycle", accessorKey: "leadState", cell: ({ row }) => <LeadStateBadge state={row.original.leadState} explain={false} /> },
  { id: "campaign", header: "Campaign", accessorKey: "campaignName", meta: { hideBelow: "lg", className: "max-w-44 truncate" }, cell: ({ row }) => <span className="block max-w-44 truncate">{row.original.campaignName ?? "—"}</span> },
  { id: "owner", header: "Owner", accessorKey: "ownerName", meta: { hideBelow: "xl" } },
  {
    id: "lastContact",
    header: "Last contact",
    accessorFn: (c) => c.lastContactAt ?? "",
    cell: ({ row }) => (row.original.lastContactAt ? timeAgo(row.original.lastContactAt) : <span className="text-fg-muted">Not yet</span>),
  },
  { id: "attempts", header: "Attempts", accessorKey: "attempts", meta: { align: "right" } },
  { id: "next", header: "Next action", enableSorting: false, cell: ({ row }) => <NextActionLabel action={row.original.nextAction} className="max-w-44" />, meta: { hideBelow: "lg" } },
];

function MobileCard({ c }: { c: Contact }) {
  const name = `${c.firstName} ${c.lastName}`;
  return (
    <div className="flex items-start gap-3">
      <Avatar name={name} initials={initials(name)} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-fg">{name}</span>
          <LeadStateBadge state={c.leadState} size="sm" explain={false} />
        </div>
        <Mono className="text-xs text-fg-secondary">{formatPhone(c.phone)}</Mono>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-fg-muted">
          <NextActionLabel action={c.nextAction} className="min-w-0" />
          <span className="shrink-0 tabular">{c.attempts} {c.attempts === 1 ? "attempt" : "attempts"}</span>
        </div>
      </div>
    </div>
  );
}

function PhaseTooltip({ children, label }: { children: React.ReactElement; label: string }) {
  return (
    <Tooltip content={label}>
      <span tabIndex={0} className="inline-flex rounded-md">
        {children}
      </span>
    </Tooltip>
  );
}

export function ContactsView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedId = params.get("id");

  const [filters, setFilters] = React.useState<ContactFilters>(EMPTY_FILTERS);
  const [page, setPage] = React.useState(1);
  const [selection, setSelection] = React.useState<RowSelectionState>({});

  const query = {
    page,
    pageSize: PAGE_SIZE,
    q: filters.q || undefined,
    leadState: filters.leadState === "all" ? undefined : filters.leadState,
    campaignId: filters.campaignId === "all" ? undefined : filters.campaignId,
    ownerId: filters.ownerId === "all" ? undefined : filters.ownerId,
  };
  const { data, isLoading, isError, refetch, isFetching } = useContacts(query);

  const onFilterChange = React.useCallback((f: Partial<ContactFilters>) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
    setSelection({});
  }, []);

  const setDrawer = (id: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("id", id);
    else next.delete("id");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const selectedCount = Object.keys(selection).length;
  const hasFilters = filters.q || filters.leadState !== "all" || filters.campaignId !== "all" || filters.ownerId !== "all";

  return (
    <Page>
      <PageHeader
        title="Contacts"
        description={
          data ? (
            <>
              <span className="text-fg tabular">{formatNumber(data.total)}</span> leads synced from GoHighLevel. Lifecycle, attempts and next action are tracked here.
            </>
          ) : (
            "Leads synced from GoHighLevel. Lifecycle, attempts and next action are tracked here."
          )
        }
      />

      <Card className="overflow-hidden">
        {selectedCount > 0 ? (
          <div className="dark flex flex-wrap items-center gap-2 border-b border-border bg-surface p-3 text-fg" role="toolbar" aria-label="Bulk actions">
            <span className="mr-2 text-[13px] font-medium text-fg tabular">{selectedCount} selected</span>
            <PhaseTooltip label="Bulk campaign assignment ships in Phase 2">
              <Button size="sm" disabled>
                <Megaphone /> Add to campaign
              </Button>
            </PhaseTooltip>
            <PhaseTooltip label="Owner assignment ships in Phase 2">
              <Button size="sm" disabled>
                <UserRoundCog /> Assign owner
              </Button>
            </PhaseTooltip>
            <PhaseTooltip label="CSV export ships in Phase 2">
              <Button size="sm" disabled>
                <Download /> Export
              </Button>
            </PhaseTooltip>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelection({})}>
              <X /> Clear
            </Button>
          </div>
        ) : (
          <ContactsToolbar filters={filters} onChange={onFilterChange} />
        )}

        {isError ? (
          <ErrorState onRetry={() => refetch()} description="Contacts could not be loaded. Nothing was changed." />
        ) : (
          <div aria-busy={isFetching} className={isFetching && !isLoading ? "opacity-70 transition-opacity" : undefined}>
            <DataTable
              caption="Contacts"
              data={data?.items ?? []}
              columns={columns}
              getRowId={(c) => c.id}
              loading={isLoading}
              onRowClick={(c) => setDrawer(c.id)}
              selectedRowId={selectedId ?? undefined}
              rowSelection={selection}
              onRowSelectionChange={setSelection}
              mobileCard={(c) => <MobileCard c={c} />}
              empty={
                <EmptyState
                  icon={ContactIcon}
                  title={hasFilters ? "No contacts match these filters" : "No contacts yet"}
                  description={
                    hasFilters
                      ? "Try a different search or clear the filters."
                      : "Contacts appear here as soon as GoHighLevel sends them. Check the GoHighLevel connection in Integrations."
                  }
                  action={
                    hasFilters ? (
                      <Button size="sm" onClick={() => onFilterChange(EMPTY_FILTERS)}>
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              }
            />
          </div>
        )}

        {data && data.total > 0 && (
          <div className="border-t border-border">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={data.total}
              label="contacts"
              onPageChange={(p) => {
                setPage(p);
                setSelection({});
              }}
            />
          </div>
        )}
      </Card>

      <ContactDrawer contactId={selectedId} onClose={() => setDrawer(null)} />
    </Page>
  );
}
