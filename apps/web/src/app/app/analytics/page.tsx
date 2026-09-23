import type { Metadata } from "next";
import { Guard } from "@/components/app/guard";
import { AnalyticsScreen } from "@/features/analytics/analytics-screen";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <Guard permission="analytics.view" area="Analytics">
      <AnalyticsScreen />
    </Guard>
  );
}
