"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog as D } from "radix-ui";
import { useTheme } from "next-themes";
import { can } from "@dialbrio/types";
import { Contact, Megaphone, Moon, PhoneCall, Plus, Search, Sun } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { useCampaigns, useContacts } from "@/lib/queries";
import { useRole } from "@/lib/session";
import { useShellStore } from "@/lib/stores/shell";
import { Kbd } from "@/components/ui/kbd";
import { formatPhone } from "@/lib/utils";

function useDebounced<T>(value: T, ms = 200) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const itemClass =
  "flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[13px] text-fg data-[selected=true]:bg-surface-hover max-lg:h-11 [&_svg]:size-4 [&_svg]:text-fg-muted";
const groupClass = "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-fg-muted";

/** ⌘K: navigate, search contacts/campaigns, run actions. Results respect the user's role. */
export function CommandPalette() {
  const open = useShellStore((s) => s.commandOpen);
  const setOpen = useShellStore((s) => s.setCommandOpen);
  const toggleSidebar = useShellStore((s) => s.toggleSidebar);
  const router = useRouter();
  const role = useRole();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = React.useState("");
  const q = useDebounced(query.trim());
  const contacts = useContacts({ q, pageSize: 6 });
  const campaigns = useCampaigns();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useShellStore.getState().commandOpen);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen, toggleSidebar]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const nav = role ? ALL_NAV_ITEMS.filter((i) => can(role, i.permission)) : [];
  const matchingCampaigns = q ? (campaigns.data ?? []).filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-[fade-in_var(--duration-base)_ease-out]" />
        <D.Content className="fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg outline-none data-[state=open]:animate-[menu-in_var(--duration-base)_var(--ease-out)]">
          <D.Title className="sr-only">Search and commands</D.Title>
          <D.Description className="sr-only">Search contacts and campaigns, navigate, or run a command.</D.Description>
          <Command shouldFilter={false} label="Command palette" className="flex flex-col">
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search className="size-4 text-fg-muted" aria-hidden />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search contacts, campaigns, pages…"
                className="h-12 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-muted"
              />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
              <Command.Empty className="py-10 text-center text-[13px] text-fg-muted">No results for “{query}”.</Command.Empty>

              {q && (contacts.data?.items.length ?? 0) > 0 && (
                <Command.Group heading="Contacts" className={groupClass}>
                  {contacts.data!.items.map((c) => (
                    <Command.Item key={c.id} value={`contact-${c.id}`} onSelect={() => go(`/app/contacts?id=${c.id}`)} className={itemClass}>
                      <Contact />
                      <span className="flex-1 truncate">
                        {c.firstName} {c.lastName}
                      </span>
                      <span className="font-mono text-xs text-fg-muted">{formatPhone(c.phone)}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {matchingCampaigns.length > 0 && (
                <Command.Group heading="Campaigns" className={groupClass}>
                  {matchingCampaigns.map((c) => (
                    <Command.Item key={c.id} value={`campaign-${c.id}`} onSelect={() => go(`/app/campaigns?id=${c.id}`)} className={itemClass}>
                      <Megaphone />
                      <span className="flex-1 truncate">{c.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {!q && role && (
                <Command.Group heading="Actions" className={groupClass}>
                  {can(role, "dialer.use") && (
                    <Command.Item value="start-dialing" onSelect={() => go("/app/dialer")} className={itemClass}>
                      <PhoneCall /> Start dialing
                    </Command.Item>
                  )}
                  {can(role, "campaigns.manage") && (
                    <Command.Item value="new-campaign" onSelect={() => go("/app/campaigns/new")} className={itemClass}>
                      <Plus /> New campaign
                    </Command.Item>
                  )}
                  <Command.Item
                    value="toggle-theme"
                    onSelect={() => {
                      setTheme(resolvedTheme === "dark" ? "light" : "dark");
                      setOpen(false);
                    }}
                    className={itemClass}
                  >
                    {resolvedTheme === "dark" ? <Sun /> : <Moon />} Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
                  </Command.Item>
                </Command.Group>
              )}

              {(() => {
                const pages = nav.filter((i) => !q || `${i.label} ${i.keywords ?? ""}`.toLowerCase().includes(q.toLowerCase()));
                return pages.length ? (
                  <Command.Group heading="Go to" className={groupClass}>
                    {pages.map((i) => (
                      <Command.Item key={i.href} value={`nav-${i.href}`} onSelect={() => go(i.href)} className={itemClass}>
                        <i.icon /> {i.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null;
              })()}
            </Command.List>
            <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-fg-muted">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> open
              </span>
              <span className="ml-auto flex items-center gap-1">
                <Kbd>⌘\</Kbd> toggle sidebar
              </span>
            </div>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
