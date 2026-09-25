import type { Metadata } from "next";
import { LEAD_STATE_META, LeadStateBadge } from "@/components/marketing/status";
import { Compliance, CrmWorkflow, FinalCta } from "@/components/marketing/home";
import { PageHero } from "@/components/marketing/page-hero";
import { Container, Section, SectionHeading } from "@/components/marketing/primitives";
import { LEAD_STATES } from "@/lib/vocabulary";
import { Reveal } from "@/components/marketing/motion";

export const metadata: Metadata = { title: "Product", description: "How DialBrio moves a lead from form fill to booked appointment, and syncs every step back to your CRM." };

const steps = [
  ["Lead arrives", "A form fill, ad lead or CRM stage change lands in DialBrio within seconds, deduplicated by phone and CRM id."],
  ["Prioritized", "Queue rules place it by lifecycle, source and speed-to-lead window. The reason is shown to the rep."],
  ["Dialed", "Checked against DNC, consent and calling hours, then dialed on a healthy local number, one line or up to four."],
  ["Conversation", "Script, notes and the lead's history sit next to the call. SMS and email live on the same record."],
  ["Outcome", "One keystroke records the disposition. Callbacks, retries and follow-up sequences are scheduled automatically."],
  ["Synced", "Disposition, notes, tags and appointments write back to the CRM, with the sync state visible on every contact."],
];

export default function ProductPage() {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="From form fill to booked call, without leaving the dialer."
        description="DialBrio owns the calling work: queues, dials, outcomes, follow-up and compliance. Your CRM stays the system of record, and every result lands back in it."
      />

      <Section aria-labelledby="steps-title">
        <Container>
          <SectionHeading id="steps-title" eyebrow="How a lead moves" title="Six steps, one screen for the rep" />
          <Reveal>
          <ol className="mt-12 grid gap-x-10 border-t border-border md:grid-cols-2 lg:grid-cols-3">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4 border-b border-border py-6">
                <span className="font-mono text-[13px] font-semibold text-brand-text">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-[16px] font-semibold text-fg">{t}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.6] text-fg-secondary">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          </Reveal>
        </Container>
      </Section>

      <Section surface aria-labelledby="lifecycle-title">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="lifecycle-title"
            eyebrow="Lead lifecycle"
            title="Fresh, Warm, Aged, Zombie"
            description="Lifecycle is a first-class state in DialBrio, not a CRM tag somebody forgot to update. Queues select leads by state, and every change is recorded with a reason."
          />
          <Reveal delay={0.1}>
          <dl className="divide-y divide-border border-y border-border">
            {LEAD_STATES.map((s) => (
              <div key={s} className="grid gap-2 py-5 sm:grid-cols-[120px_1fr] sm:items-baseline">
                <dt>
                  <LeadStateBadge state={s} explain={false} />
                </dt>
                <dd className="text-[14.5px] leading-[1.6] text-fg-secondary">{LEAD_STATE_META[s].description}.</dd>
              </div>
            ))}
          </dl>
          </Reveal>
        </Container>
      </Section>

      <CrmWorkflow />
      <Compliance />
      <FinalCta />
    </>
  );
}
