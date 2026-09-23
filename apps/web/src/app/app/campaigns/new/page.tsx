import type { Metadata } from "next";
import { Guard } from "@/components/app/guard";
import { CampaignWizard } from "@/features/campaigns/wizard/campaign-wizard";

export const metadata: Metadata = { title: "New campaign" };

export default function NewCampaignPage() {
  return (
    <Guard permission="campaigns.manage" area="campaign creation">
      <CampaignWizard />
    </Guard>
  );
}
