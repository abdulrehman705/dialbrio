import type { Metadata } from "next";
import { Guard } from "@/components/app/guard";
import { BillingScreen } from "@/features/billing/billing-screen";

export const metadata: Metadata = { title: "Billing & usage" };

export default function BillingPage() {
  return (
    <Guard permission="billing.manage" area="Billing">
      <BillingScreen />
    </Guard>
  );
}
