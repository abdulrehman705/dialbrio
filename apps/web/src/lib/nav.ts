import {
  Bot,
  CalendarDays,
  ChartColumn,
  Contact,
  CreditCard,
  Hash,
  LayoutDashboard,
  ListOrdered,
  Megaphone,
  MessagesSquare,
  PhoneCall,
  Plug,
  Settings,
  ShieldCheck,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@dialbrio/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  /** Shown in the command palette as a keyword. */
  keywords?: string;
  /** Phase in which the screen ships (for the honest "planned" state). */
  plannedPhase?: string;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

/** Sidebar information architecture (docs/design.md §13, docs/product-map.md §6). */
export const NAV: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Overview", href: "/app", icon: LayoutDashboard, permission: "overview.view", keywords: "dashboard home kpi" },
      { label: "Dialer", href: "/app/dialer", icon: PhoneCall, permission: "dialer.use", keywords: "call session power dialer" },
      { label: "Queue", href: "/app/queue", icon: ListOrdered, permission: "queue.manage", keywords: "queues priority leads waiting" },
      { label: "Campaigns", href: "/app/campaigns", icon: Megaphone, permission: "campaigns.view", keywords: "campaign wizard" },
      { label: "Conversations", href: "/app/conversations", icon: MessagesSquare, permission: "conversations.view", keywords: "sms inbox messages" },
      { label: "Contacts", href: "/app/contacts", icon: Contact, permission: "contacts.view", keywords: "leads people" },
      { label: "Calendar", href: "/app/calendar", icon: CalendarDays, permission: "calendar.view", keywords: "appointments booking", plannedPhase: "Phase 4" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", href: "/app/analytics", icon: ChartColumn, permission: "analytics.view", keywords: "reports reporting metrics" },
      { label: "AI QA", href: "/app/ai-qa", icon: Bot, permission: "aiqa.view", keywords: "quality transcripts coaching", plannedPhase: "Phase 5" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Phone Numbers", href: "/app/numbers", icon: Hash, permission: "numbers.view", keywords: "caller id number health spam", plannedPhase: "Phase 3" },
      { label: "Workflows", href: "/app/workflows", icon: Workflow, permission: "workflows.manage", keywords: "follow-up sequences retry", plannedPhase: "Phase 2" },
      { label: "Compliance", href: "/app/compliance", icon: ShieldCheck, permission: "compliance.view", keywords: "dnc a2p stir shaken", plannedPhase: "Phase 3" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Team", href: "/app/team", icon: UsersRound, permission: "team.manage", keywords: "users roles agents", plannedPhase: "Phase 1" },
      { label: "Integrations", href: "/app/integrations", icon: Plug, permission: "integrations.manage", keywords: "ghl gohighlevel twilio stripe" },
      { label: "Billing", href: "/app/billing", icon: CreditCard, permission: "billing.manage", keywords: "plan usage invoices", plannedPhase: "Phase 7" },
      { label: "Settings", href: "/app/settings", icon: Settings, permission: "settings.view", keywords: "preferences configuration" },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);

export function navItemFor(pathname: string): NavItem | undefined {
  return [...ALL_NAV_ITEMS].sort((a, b) => b.href.length - a.href.length).find((i) => (i.href === "/app" ? pathname === "/app" : pathname.startsWith(i.href)));
}
