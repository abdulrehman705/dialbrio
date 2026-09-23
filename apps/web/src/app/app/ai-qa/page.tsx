import type { Metadata } from "next";
import { PlannedModule } from "@/components/app/planned-module";
import { Guard } from "@/components/app/guard";

export const metadata: Metadata = { title: "AI QA" };

export default function AiQaPage() {
  return (
    <Guard permission="aiqa.view" area="AI QA">
      <PlannedModule
        title="AI QA"
        description="A coach on every call, so managers stop coaching from the three calls they had time to hear."
        phase="Phase 5"
        intro="Every conversation will be transcribed, scored against your playbook and mined for objections. Scores come with confidence and evidence from the transcript. They never change a disposition or a compliance decision on their own, and if the AI provider is down, calling carries on."
        capabilities={[
          { title: "Playbook scoring", detail: "Each call is graded on opener, discovery, objection handling and close attempt, and the calls worth a manager's attention rise to the top.", spec: "0–100 playbook score" },
          { title: "Transcripts & sentiment", detail: "Full-call transcripts with speaker separation and sentiment, searchable across your whole call history.", spec: "every call, every plan" },
          { title: "Objection analytics", detail: "See which objections kill deals, which rebuttals work, and how your best reps phrase them, aggregated across the team.", spec: "team-wide pattern mining" },
          { title: "Whisper & barge", detail: "Managers listen live, whisper prompts only the rep hears, or join the call. Arrives with the live monitor on the Team plan.", spec: "listen · whisper · barge" },
        ]}
        related={[{ label: "Connect an AI provider in Integrations", href: "/app/integrations" }]}
      />
    </Guard>
  );
}
