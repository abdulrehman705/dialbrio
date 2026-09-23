import type { Role } from "./domain";

/**
 * Role → capability map. Shared by the API (RolesGuard) and the web app (navigation visibility).
 * The web app uses this only to hide UI; the API is the enforcement point.
 */
export const PERMISSIONS = {
  "overview.view": ["admin", "manager", "agent"],
  "dialer.use": ["admin", "manager", "agent"],
  "queue.manage": ["admin", "manager"],
  "campaigns.view": ["admin", "manager", "agent"],
  "campaigns.manage": ["admin", "manager"],
  "conversations.view": ["admin", "manager", "agent"],
  "contacts.view": ["admin", "manager", "agent"],
  "calendar.view": ["admin", "manager", "agent"],
  "analytics.view": ["admin", "manager", "agent"],
  "analytics.team": ["admin", "manager"],
  "aiqa.view": ["admin", "manager", "agent"],
  "numbers.view": ["admin", "manager"],
  "numbers.manage": ["admin"],
  "workflows.manage": ["admin", "manager"],
  "compliance.view": ["admin", "manager"],
  "compliance.manage": ["admin"],
  "team.manage": ["admin", "manager"],
  "integrations.manage": ["admin"],
  "billing.manage": ["admin"],
  "settings.view": ["admin", "manager", "agent"],
  "settings.organization": ["admin"],
  "settings.dialer": ["admin", "manager"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
