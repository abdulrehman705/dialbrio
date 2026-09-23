"use client";

import type { SettingsSection } from "@dialbrio/types";
import { useCan } from "@/lib/session";
import { sectionConfig } from "../section-config";

export function useCanEdit(section: SettingsSection) {
  return useCan(sectionConfig(section).edit) ?? false;
}

export const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (New York)" },
  { value: "America/Chicago", label: "Central (Chicago)" },
  { value: "America/Denver", label: "Mountain (Denver)" },
  { value: "America/Phoenix", label: "Mountain, no DST (Phoenix)" },
  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { value: "UTC", label: "UTC" },
];
