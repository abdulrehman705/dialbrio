"use client";

import type { SettingsSection } from "@dialbrio/types";
import { AiSettings } from "./ai";
import { BillingSettings } from "./billing";
import { ComplianceSettings } from "./compliance";
import { CrmSettings } from "./crm";
import { DeveloperSettings } from "./developer";
import { DialerSettings } from "./dialer";
import { GeneralSettings } from "./general";
import { NotificationSettings } from "./notifications";
import { NumbersSettings } from "./numbers";
import { OrganizationSettings } from "./organization";
import { TeamSettings } from "./team";

const SECTIONS: Record<SettingsSection, React.ComponentType> = {
  general: GeneralSettings,
  organization: OrganizationSettings,
  team: TeamSettings,
  dialer: DialerSettings,
  numbers: NumbersSettings,
  compliance: ComplianceSettings,
  crm: CrmSettings,
  ai: AiSettings,
  notifications: NotificationSettings,
  billing: BillingSettings,
  developer: DeveloperSettings,
};

export function SettingsSectionView({ section }: { section: SettingsSection }) {
  const View = SECTIONS[section];
  return <View />;
}
