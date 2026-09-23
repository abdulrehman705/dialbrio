import type { Metadata } from "next";
import { PlannedModule } from "@/components/app/planned-module";
import { Guard } from "@/components/app/guard";

export const metadata: Metadata = { title: "Workflows" };

export default function WorkflowsPage() {
  return (
    <Guard permission="workflows.manage" area="Workflows">
      <PlannedModule
        title="Workflows"
        description="What happens after every call that doesn't connect."
        phase="Phase 2"
        intro="No-answers will flow into multi-touch cadences until the lead answers or the sequence ends. For example: call, no answer, wait 30 minutes, retry, wait 4 hours, text, retry tomorrow. Sequences run on a durable engine, so a deploy or restart never drops a step."
        capabilities={[
          { title: "Sequence steps", detail: "Call, wait, retry, SMS, email, voicemail drop, callback, appointment, stop, DNC.", spec: "5+ touches, fully automatic" },
          { title: "Compliance on every step", detail: "Each step re-checks DNC, consent and the lead's local calling hours before it acts." },
          { title: "Stops when it should", detail: "A reply, a booking or an opt-out ends the sequence immediately. Nobody gets texted after they said stop." },
          { title: "Per-campaign defaults", detail: "Campaigns pick a sequence in the wizard's follow-up step. A visual editor comes after the engine is proven." },
        ]}
        related={[{ label: "Follow-up step in the campaign wizard", href: "/app/campaigns/new" }]}
      />
    </Guard>
  );
}
