import type { Metadata } from "next";
import { Suspense } from "react";
import { Guard } from "@/components/app/guard";
import { CampaignList } from "@/features/campaigns/campaign-list";

export const metadata: Metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return (
    <Guard permission="campaigns.view" area="Campaigns">
      <Suspense>
        <CampaignList />
      </Suspense>
    </Guard>
  );
}
