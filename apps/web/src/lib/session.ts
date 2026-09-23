"use client";

import { can, type Permission, type Role } from "@dialbrio/types";
import { useMe } from "@/lib/queries";
import { useShellStore } from "@/lib/stores/shell";

/** Effective role for UI visibility. The API remains the enforcement point. */
export function useRole(): Role | undefined {
  const { data } = useMe();
  const preview = useShellStore((s) => s.previewRole);
  return data ? (preview ?? data.role) : undefined;
}

export function useCan(permission: Permission): boolean | undefined {
  const role = useRole();
  return role ? can(role, permission) : undefined;
}
