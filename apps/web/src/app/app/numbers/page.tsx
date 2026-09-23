import type { Metadata } from "next";
import { PlannedModule } from "@/components/app/planned-module";
import { Guard } from "@/components/app/guard";

export const metadata: Metadata = { title: "Phone Numbers" };

export default function NumbersPage() {
  return (
    <Guard permission="numbers.view" area="Phone Numbers">
      <PlannedModule
        title="Phone Numbers"
        description="Caller IDs, their reputation, and which campaigns they dial for."
        phase="Phase 3"
        intro="Number health already feeds the Overview and the dialer's caller ID picker. This screen will be where you buy, assign, rest and retire numbers. Local numbers are $2 a month on every plan."
        capabilities={[
          { title: "Local presence", detail: "Calls go out from a local caller ID drawn from a rotating pool, matched to the lead's area code when a healthy number exists.", spec: "auto rotation" },
          { title: "Spam remediation", detail: "Numbers flagged as spam by a carrier are quarantined, rested, and swapped out of campaigns automatically.", spec: "Healthy · Watch · At risk · Cooling down" },
          { title: "Registration status", detail: "A2P 10DLC brand and campaign status and STIR/SHAKEN attestation, per number." },
          { title: "Branded caller ID", detail: "CNAM and branded calling where carriers support it, to lift answer rates on cold lists." },
        ]}
        related={[
          { label: "Number health on the Overview", href: "/app" },
          { label: "Twilio in Integrations", href: "/app/integrations" },
        ]}
      />
    </Guard>
  );
}
