import type { Metadata } from "next";
import { Guard } from "@/components/app/guard";
import { IntegrationsCenter } from "@/features/integrations/integrations-center";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <Guard permission="integrations.manage" area="Integrations">
      <IntegrationsCenter />
    </Guard>
  );
}
