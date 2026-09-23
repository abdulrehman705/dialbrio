import type { Metadata } from "next";
import { PlannedModule } from "@/components/app/planned-module";
import { Guard } from "@/components/app/guard";

export const metadata: Metadata = { title: "Compliance" };

export default function CompliancePage() {
  return (
    <Guard permission="compliance.view" area="Compliance">
      <PlannedModule
        title="Compliance"
        description="Enforced by the system, not the honor system. Included on every plan."
        phase="Phase 3"
        intro="The dialer already blocks do-not-call numbers and calls outside the lead's calling window before a call is placed. This screen will show every rule, every registration and every blocked attempt. Decisions are deterministic and logged; AI can never override them."
        capabilities={[
          { title: "DNC & consent at dial time", detail: "Federal, state and internal do-not-call lists are checked before every dial. Contacts without valid consent can't be queued.", spec: "blocked at dial time" },
          { title: "Calling-hours guardrails", detail: "Windows follow the lead's time zone and the stricter state rules, so reps never need to know which state stops at 8 p.m.", spec: "per-state rule engine" },
          { title: "Audit trail & retention", detail: "Immutable logs of consent source, dial attempts, recordings and opt-outs. Export them when your lawyer asks; set retention when they insist.", spec: "export-ready logs" },
          { title: "Registrations", detail: "A2P 10DLC brand and campaign status and STIR/SHAKEN attestation, with what's blocking approval." },
        ]}
        related={[{ label: "Compliance defaults in Settings", href: "/app/settings/compliance" }]}
      />
    </Guard>
  );
}
