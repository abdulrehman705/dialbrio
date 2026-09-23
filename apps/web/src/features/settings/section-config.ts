import type { Permission, SettingsSection } from "@dialbrio/types";
import { Bell, Bot, Building2, Code, CreditCard, Database, Hash, PhoneCall, ShieldCheck, SlidersHorizontal, UsersRound, type LucideIcon } from "lucide-react";

export interface SectionConfig {
  id: SettingsSection;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Who can see the section (hidden otherwise). */
  view: Permission;
  /** Who can change it; viewers without this see it read-only. */
  edit: Permission;
}

/**
 * Role → settings section mapping. Mirrors the API; the API enforces it.
 * Admin: everything. Manager: General, Team, Dialer, Numbers (view), Compliance (view), Notifications.
 * Agent: General, Dialer (read-only), Notifications.
 */
export const SETTINGS_SECTIONS_CONFIG: SectionConfig[] = [
  { id: "general", label: "General", description: "Your profile, time zone and display preferences.", icon: SlidersHorizontal, view: "settings.view", edit: "settings.view" },
  { id: "organization", label: "Organization", description: "Organization details and sub-accounts.", icon: Building2, view: "settings.organization", edit: "settings.organization" },
  { id: "team", label: "Team & Roles", description: "What each role can access.", icon: UsersRound, view: "team.manage", edit: "team.manage" },
  { id: "dialer", label: "Dialer", description: "Defaults for dialing sessions in this sub-account.", icon: PhoneCall, view: "settings.view", edit: "settings.dialer" },
  { id: "numbers", label: "Numbers", description: "Caller ID inventory and health at a glance.", icon: Hash, view: "numbers.view", edit: "numbers.manage" },
  { id: "compliance", label: "Compliance", description: "Calling windows, DNC and consent rules.", icon: ShieldCheck, view: "compliance.view", edit: "compliance.manage" },
  { id: "crm", label: "CRM", description: "How outcomes sync to GoHighLevel.", icon: Database, view: "integrations.manage", edit: "integrations.manage" },
  { id: "ai", label: "AI", description: "Provider and AI-assisted features.", icon: Bot, view: "settings.organization", edit: "settings.organization" },
  { id: "notifications", label: "Notifications", description: "Which events reach you, and where.", icon: Bell, view: "settings.view", edit: "settings.view" },
  { id: "billing", label: "Billing", description: "Plan, spend cap and client billing. Invoices live on the Billing page.", icon: CreditCard, view: "billing.manage", edit: "billing.manage" },
  { id: "developer", label: "Developer", description: "API keys and outbound webhooks.", icon: Code, view: "settings.organization", edit: "settings.organization" },
];

export const sectionConfig = (id: SettingsSection) => SETTINGS_SECTIONS_CONFIG.find((s) => s.id === id)!;
