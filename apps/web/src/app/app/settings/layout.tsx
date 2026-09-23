import { Guard } from "@/components/app/guard";
import { SettingsFrame } from "@/features/settings/settings-frame";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard permission="settings.view" area="Settings">
      <SettingsFrame>{children}</SettingsFrame>
    </Guard>
  );
}
