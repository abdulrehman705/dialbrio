import type { Metadata } from "next";
import { FinalCta, aiFeatures } from "@/components/marketing/home";
import { PageHero } from "@/components/marketing/page-hero";
import { CheckList, Container, FeatureGrid, Section, SectionHeading } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/motion";

export const metadata: Metadata = { title: "AI", description: "Transcription, call scoring, objection analytics and AI voice agents, built on top of a dialer that works without them." };

export default function AiPage() {
  return (
    <>
      <PageHero
        eyebrow="AI intelligence"
        title="A coach on every single call."
        description="Transcripts, playbook scores and objection patterns for every conversation, so managers coach from data. It ships in the AI release; calling works fully without it."
      />
      <Section aria-labelledby="ai-features">
        <Container>
          <SectionHeading id="ai-features" eyebrow="What's coming" title="Scoring, coaching and agents" description="Items below are on the roadmap for the AI release. The AI voice and SMS agents are part of the Agency and Enterprise plans." />
          <FeatureGrid items={aiFeatures.map((f) => ({ ...f, status: "planned" as const }))} className="mt-12 lg:grid-cols-3" />
        </Container>
      </Section>
      <Section surface aria-labelledby="ai-rules">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            id="ai-rules"
            eyebrow="Ground rules"
            title="AI suggests. Your rules decide."
            description="We built the dialer first so AI can fail without taking calling down with it."
          />
          <Reveal delay={0.1}>
          <CheckList
            items={[
              "Every AI result shows its confidence. Nothing is presented as certain.",
              "AI can suggest a disposition. A rep or a deterministic rule records it.",
              "DNC, consent and calling hours are never overridden by a model.",
              "AI voice agents always disclose that they are automated, and hand off to a human when a lead gets serious.",
              "Providers are swappable. Transcripts and recordings stay in your storage.",
            ]}
          />
          </Reveal>
        </Container>
      </Section>
      <FinalCta />
    </>
  );
}
