import type { Metadata } from "next";
import { PlannedModule } from "@/components/app/planned-module";
import { Guard } from "@/components/app/guard";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <Guard permission="team.manage" area="Team">
      <PlannedModule
        title="Team"
        description="Who can dial, who can manage, and which clients they work on."
        phase="Phase 1"
        intro="Roles are already enforced: navigation hides what a role can't use, and the API checks every request. This screen will add inviting people, grouping reps into teams, and adding seats."
        capabilities={[
          { title: "Invite by email", detail: "Admin, Manager or Agent, per client sub-account. Seats are prorated by the day, so a rep added mid-month costs only the days they're active.", spec: "$59/seat · 5-pack $225" },
          { title: "Teams", detail: "Group reps for queue assignment, leaderboards and reporting." },
          { title: "Live call monitor", detail: "Managers see who's on a call and can listen, whisper or barge (Team plan and up)." },
          { title: "Audit trail", detail: "Every role and membership change is written to the audit log." },
        ]}
        related={[
          { label: "Role access in Settings", href: "/app/settings/team" },
          { label: "Seats on the Billing page", href: "/app/billing" },
        ]}
      />
    </Guard>
  );
}
