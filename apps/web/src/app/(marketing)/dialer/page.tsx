import type { Metadata } from "next";
import { DialingEngine, FinalCta } from "@/components/marketing/home";
import { HeroProduct } from "@/components/marketing/hero-product";
import { PageHero } from "@/components/marketing/page-hero";
import { Container, Section, SectionHeading } from "@/components/marketing/primitives";

export const metadata: Metadata = { title: "Dialer", description: "Power and parallel dialing with answer-machine detection, voicemail drop, local presence and keyboard-first dispositions." };

const details = [
  ["Keyboard first", "Space calls or hangs up, M mutes, 1–9 records the outcome, ⌘↵ saves and loads the next lead."],
  ["Every lead explains itself", "Lifecycle, attempts, retry window and speed-to-lead SLA sit next to the name."],
  ["Checks before the dial", "DNC, consent and calling hours are checked first. If a call is blocked, the rep sees why."],
  ["Honest failure states", "Busy, no answer or carrier rejection, with the carrier's reason and a retry when the rules allow it."],
  ["Callbacks that happen", "Scheduled in the contact's time zone and routed back to the rep who promised them."],
  ["Outcome sync", "Dispositions, notes and tags write back to GoHighLevel, with the sync state visible on the call."],
];

export default function DialerPage() {
  return (
    <>
      <PageHero
        eyebrow="Dialer"
        title="The screen your reps live in for eight hours."
        description="Pick the right lead, dial, talk, record the outcome, move on. Every part of the dialer exists to take a click out of that loop."
      >
        <div className="h-24 md:h-32" aria-hidden />
      </PageHero>
      <Container className="-mt-24 md:-mt-32">
        <HeroProduct className="mx-auto max-w-[1080px]" />
      </Container>
      <DialingEngine />
      <Section surface aria-labelledby="dialer-details">
        <Container>
          <SectionHeading id="dialer-details" eyebrow="Details" title="Small things that add up over 300 calls" />
          <dl className="mt-10 grid gap-x-12 border-t border-border md:grid-cols-2">
            {details.map(([t, d]) => (
              <div key={t} className="border-b border-border py-5">
                <dt className="text-[16px] font-semibold text-fg">{t}</dt>
                <dd className="mt-1.5 text-[14.5px] leading-[1.6] text-fg-secondary">{d}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
      <FinalCta />
    </>
  );
}
