"use client";

import * as React from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import type { LeadState } from "@dialbrio/types";
import { useAgentActivity, useCampaigns } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import { Field } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface ContactFilters {
  q: string;
  leadState: LeadState | "all";
  campaignId: string;
  ownerId: string;
}

export const EMPTY_FILTERS: ContactFilters = { q: "", leadState: "all", campaignId: "all", ownerId: "all" };

const lifecycleOptions: { value: ContactFilters["leadState"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fresh", label: "Fresh" },
  { value: "warm", label: "Warm" },
  { value: "aged", label: "Aged" },
  { value: "zombie", label: "Zombie" },
];

interface ToolbarProps {
  filters: ContactFilters;
  onChange: (f: Partial<ContactFilters>) => void;
}

function useFilterOptions() {
  const campaigns = useCampaigns();
  const agents = useAgentActivity();
  const campaignOptions = [{ value: "all", label: "All campaigns" }, ...(campaigns.data ?? []).map((c) => ({ value: c.id, label: c.name }))];
  const ownerOptions = [{ value: "all", label: "All owners" }, ...(agents.data ?? []).map((a) => ({ value: a.userId, label: a.name }))];
  return { campaignOptions, ownerOptions };
}

export function ContactsToolbar({ filters, onChange }: ToolbarProps) {
  const [q, setQ] = React.useState(filters.q);
  const { campaignOptions, ownerOptions } = useFilterOptions();

  // Debounce search input → filters
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (q !== filters.q) onChange({ q });
    }, 250);
    return () => clearTimeout(t);
  }, [q, filters.q, onChange]);

  const activeCount = (filters.leadState !== "all" ? 1 : 0) + (filters.campaignId !== "all" ? 1 : 0) + (filters.ownerId !== "all" ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search contacts"
        aria-label="Search contacts"
        leadingIcon={<Search />}
        className="min-w-0 flex-1 md:max-w-xs"
        trailing={
          q ? (
            <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="rounded-sm p-1 text-fg-muted hover:text-fg">
              <X className="size-3.5" />
            </button>
          ) : undefined
        }
      />

      {/* Desktop filters */}
      <div className="hidden items-center gap-2 lg:flex">
        <Segmented label="Lifecycle" value={filters.leadState} onValueChange={(v) => onChange({ leadState: v })} options={lifecycleOptions} />
        <Select size="sm" aria-label="Campaign" value={filters.campaignId} onValueChange={(v) => onChange({ campaignId: v })} options={campaignOptions} className="w-52" />
        <Select size="sm" aria-label="Owner" value={filters.ownerId} onValueChange={(v) => onChange({ ownerId: v })} options={ownerOptions} className="w-40" />
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ leadState: "all", campaignId: "all", ownerId: "all" })}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Mobile / tablet: filters in a bottom sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" className="max-lg:h-11 lg:hidden" aria-label={`Filters${activeCount ? `, ${activeCount} active` : ""}`}>
            <SlidersHorizontal /> Filters
            {activeCount > 0 && (
              <Badge tone="brand" size="sm">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" title="Filter contacts" description="Narrow the list by lifecycle, campaign or owner.">
          <div className="flex flex-col gap-4 overflow-y-auto p-5">
            <Field label="Lifecycle" htmlFor="f-lifecycle">
              <Select id="f-lifecycle" value={filters.leadState} onValueChange={(v) => onChange({ leadState: v as ContactFilters["leadState"] })} options={lifecycleOptions} />
            </Field>
            <Field label="Campaign" htmlFor="f-campaign">
              <Select id="f-campaign" value={filters.campaignId} onValueChange={(v) => onChange({ campaignId: v })} options={campaignOptions} />
            </Field>
            <Field label="Owner" htmlFor="f-owner">
              <Select id="f-owner" value={filters.ownerId} onValueChange={(v) => onChange({ ownerId: v })} options={ownerOptions} />
            </Field>
            <Button variant="ghost" onClick={() => onChange({ leadState: "all", campaignId: "all", ownerId: "all" })} disabled={!activeCount}>
              Clear filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
