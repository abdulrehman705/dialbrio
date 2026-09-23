"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@dialbrio/types";

/**
 * Small client-only UI state for the shell. Server state never lives here (TanStack Query owns it).
 * `previewRole` exists only for the demo: it lets reviewers see the Admin/Manager/Agent experience.
 * In production the role comes from /v1/me and cannot be changed client-side.
 */
interface ShellState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandOpen: boolean;
  subAccountId: string;
  previewRole: Role | null;
  toggleSidebar: () => void;
  setMobileNavOpen: (v: boolean) => void;
  setCommandOpen: (v: boolean) => void;
  setSubAccountId: (id: string) => void;
  setPreviewRole: (r: Role | null) => void;
}

export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      commandOpen: false,
      subAccountId: "sub_1",
      previewRole: null,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
      setCommandOpen: (v) => set({ commandOpen: v }),
      setSubAccountId: (id) => set({ subAccountId: id }),
      setPreviewRole: (r) => set({ previewRole: r }),
    }),
    {
      name: "dialbrio-shell",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, subAccountId: s.subAccountId, previewRole: s.previewRole }),
    },
  ),
);
