import type { Metadata } from "next";
import { FinalCta } from "@/components/marketing/home";
import { PageHero } from "@/components/marketing/page-hero";
import { Container, ProductFrame, Section, SectionHeading, SpecChip } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/motion";

export const metadata: Metadata = { title: "Conversations", description: "SMS and call history in one inbox, next to the dialer, with delivery state and the number used on every message." };

const thread = [
  { out: false, text: "Hi, yes I filled out the form. What's the next step?", meta: "2:41 PM" },
  { out: true, text: "Thanks Rachel. It's a free 30-minute design consult. Thursday at 10 or Saturday at 11?", meta: "Maya · 2:43 PM · delivered" },
  { out: false, text: "Saturday at 11. My husband wants to join.", meta: "2:47 PM" },
  { out: true, text: "Booked for Saturday at 11:00. You'll get a reminder the day before.", meta: "Maya · 2:48 PM · read" },
];

export default function ConversationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Conversations"
        title="Texts and calls on one record."
        description="An inbox built for follow-up: every SMS and call for a lead in one thread, which rep replied, whether it was delivered, and which number it went out on."
      />
      <Section aria-labelledby="conv-title">
        <Container className="grid gap-12 lg:grid-cols-[1fr_460px] lg:items-center lg:gap-16">
          <div>
            <SectionHeading id="conv-title" eyebrow="Inbox" title="Nothing slips between a missed call and a text back" />
            <Reveal>
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {[
                ["Filters that match the job", "Unread, mine, unassigned and team views. Search by name, number or message."],
                ["Delivery you can trust", "Queued, sent, delivered, read or failed, per message, with the reason when it fails."],
                ["The right caller ID", "Replies go out from the number the lead already knows, with A2P registration status visible."],
                ["Email and more channels", "Email arrives next. The inbox is built so new channels slot in without changing the workflow."],
              ].map(([t, d]) => (
                <div key={t} className="py-5">
                  <dt className="text-[16px] font-semibold text-fg">{t}</dt>
                  <dd className="mt-1.5 text-[14.5px] leading-[1.6] text-fg-secondary">{d}</dd>
                </div>
              ))}
            </dl>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
          <ProductFrame label="An SMS thread with Rachel Donovan: she asks about next steps and books a Saturday consult.">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold text-fg">Rachel Donovan</p>
                <p className="font-mono text-[11.5px] text-fg-muted">(303) 555-0101</p>
              </div>
              <SpecChip>from (303) 555-0142</SpecChip>
            </div>
            <ol className="flex flex-col gap-3 bg-background p-4">
              <li className="self-center rounded-full border border-border bg-surface px-3 py-1 text-[11.5px] text-fg-muted">Outbound call · no answer · 2:39 PM</li>
              {thread.map((m, i) => (
                <li key={i} className={m.out ? "flex flex-col items-end gap-1" : "flex flex-col items-start gap-1"}>
                  <span className={m.out ? "max-w-[85%] rounded-2xl rounded-br-md bg-brand-solid px-3.5 py-2 text-[13.5px] text-brand-on" : "max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2 text-[13.5px] text-fg"}>
                    {m.text}
                  </span>
                  <span className="font-mono text-[10.5px] text-fg-muted">{m.meta}</span>
                </li>
              ))}
            </ol>
          </ProductFrame>
          </Reveal>
        </Container>
      </Section>
      <FinalCta />
    </>
  );
}
