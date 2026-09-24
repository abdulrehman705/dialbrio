import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { formatPlanPrice, trialLine } from "@dialbrio/types";
import { getPriceBook } from "@/sanity/price-book";
import { Button } from "@/components/ui/button";
import { HeroProduct } from "./hero-product";
import { CountNumber, Marquee, Reveal, RevealHeading, RevealStatement } from "./motion";
import { Container, Eyebrow, FeatureCard, FeatureGrid, InkPanel, Section, SectionHeading, SpecChip, type Feature } from "./primitives";


/* ── Hero ─────────────────────────────────────────────────────────────── */

const heroStats: { prefix?: string; n?: number; suffix: string; label: string }[] = [
  { n: 350, suffix: "+", label: "dials per rep, per day" },
  { prefix: "<", n: 10, suffix: "s", label: "lead-to-dial trigger time" },
  { n: 4, suffix: " lines", label: "parallel dialing, all plans" },
];

export async function Hero() {
  const { trial } = await getPriceBook();
  return (
    <section className="bg-background pt-3 sm:pt-4">
      <div className="px-3 sm:px-4">
        <InkPanel as="div" tone="paper" className="mx-auto max-w-[1400px] pt-16 pb-40 sm:pt-20 md:pb-52">
          <Container>
            <Eyebrow>DialBrio · power dialer</Eyebrow>
            <RevealHeading
              text="Built to keep reps talking,"
              accent="not waiting for ringtones."
              className="mt-5 max-w-[880px] text-balance font-display text-[44px] leading-[1.02] font-bold tracking-[-0.04em] sm:text-[58px] lg:text-[72px]"
            />
            <p className="mt-6 max-w-[620px] text-[17px] leading-[1.6] text-fg-secondary md:text-[18px]">
              Parallel dialing, sub-10-second speed-to-lead and native GoHighLevel sync, for sales teams and the agencies that run
              calling for their clients. Compliance is enforced by the system, not by memory.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="primary" size="lg">
                <Link href="/waitlist">
                  Join waitlist <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-fg">
                <Link href="#dialing-engine">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 font-mono text-xs text-fg-muted">{trialLine(trial)}</p>

            <dl className="mt-14 grid gap-3 sm:grid-cols-3">
              {heroStats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-surface px-5 py-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-[28px] leading-8 font-bold tracking-[-0.03em] text-brand-text">
                      {s.prefix}
                      {s.n !== undefined && <CountNumber value={s.n} />}
                      {s.suffix}
                    </span>
                    <span className="mt-1 block text-[13px] text-fg-secondary">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </InkPanel>
      </div>
      <Container className="-mt-28 md:-mt-36">
        <HeroProduct className="mx-auto max-w-[1080px]" />
      </Container>
    </section>
  );
}

/* ── 01 Dialing engine ────────────────────────────────────────────────── */

const dialing: Feature[] = [
  { title: "Speed-to-lead triggers", body: "A form fill, ad lead or CRM stage change fires an instant dial to the assigned rep while the lead is still on the thank-you page.", spec: "trigger → ring in <10s" },
  { title: "Local presence & number health", body: "Calls show a local caller ID from a rotating, reputation-monitored pool. Numbers flagged as spam are quarantined and swapped automatically.", spec: "auto rotation + spam remediation" },
  { title: "Smart lead prioritization", body: "The queue reorders itself by recency, source, engagement and prior outcomes, and every lead shows why it is next.", spec: "explainable queue" },
  { title: "Auto follow-up sequences", body: "No-answers flow into cadences of calls and SMS until the lead answers or the sequence completes.", spec: "5+ touches, automatic" },
];

function LinesDiagram() {
  const rows = [
    { line: "L1", label: "Human answered", out: "bridged to rep in 0.8s", tone: "text-brand-text" },
    { line: "L2", label: "Answering machine", out: "skipped, retry later", tone: "text-fg-secondary" },
    { line: "L3", label: "No answer", out: "retry in 30 min", tone: "text-fg-secondary" },
    { line: "L4", label: "Busy", out: "retry in 15 min", tone: "text-fg-secondary" },
  ];
  return (
    <figure className="rounded-xl border border-border bg-surface p-5" aria-label="Four parallel lines: one human answer bridged to the rep, the rest handled automatically.">
      <figcaption className="mb-4 flex items-center justify-between text-[13px]">
        <span className="font-medium text-fg">One dial, four lines</span>
        <SpecChip>AMD &lt; 1s</SpecChip>
      </figcaption>
      <ol className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.line} className="grid grid-cols-[32px_1fr] gap-x-3 py-2.5 sm:grid-cols-[32px_1fr_auto]">
            <span className="font-mono text-xs text-fg-muted">{r.line}</span>
            <span className="text-[14px] text-fg">{r.label}</span>
            <span className={`font-mono text-xs max-sm:col-start-2 ${r.tone}`}>{r.out}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function DialingEngine() {
  return (
    <Section id="dialing-engine" aria-labelledby="dialing-title" className="pt-16 md:pt-24">
      <Container>
        <SectionHeading
          id="dialing-title"
          eyebrow="01 · Dialing engine"
          title="Dial 1 line at a time, or 4 at once"
          description="Take careful lists one call at a time, or run up to four lines for cold outreach. Either way your reps talk to real people, from healthy local numbers, and reach new leads first."
        />
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_440px] lg:gap-14">
          <Reveal>
            <h3 className="font-display text-[24px] leading-tight font-bold tracking-[-0.025em] text-fg">Power and parallel dialing</h3>
            <p className="mt-3 max-w-[520px] text-[16px] leading-[1.6] text-fg-secondary">
              Dial one line for careful lists or up to four in parallel for cold outreach. Answering-machine detection skips voicemail
              greetings and routes live answers to a rep in under a second. The rep only ever hears a person.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SpecChip>4 lines · all plans</SpecChip>
              <SpecChip>AMD &lt; 1s</SpecChip>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <LinesDiagram />
          </Reveal>
        </div>
        <div className="mt-14 grid gap-x-12 border-t border-border md:grid-cols-2">
          {dialing.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 0.08} className="flex flex-col gap-2 border-b border-border py-6">
              <h3 className="text-[16px] font-semibold text-fg">{f.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-fg-secondary">{f.body}</p>
              {f.spec && <SpecChip className="mt-1">{f.spec}</SpecChip>}
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ── 02 AI intelligence ───────────────────────────────────────────────── */

export const aiFeatures: Feature[] = [
  { title: "Transcription & sentiment", body: "Full-call transcripts with speaker separation, sentiment and searchable keywords across your whole call history.", spec: "every call, every plan" },
  { title: "Automated call scoring", body: "Each call is graded against your playbook: opener, discovery, objection handling, close attempt. The calls worth a manager's attention rise to the top.", spec: "0–100 playbook score" },
  { title: "Objection & talk-track analytics", body: "See which objections kill deals, which rebuttals work, and how top performers phrase them, aggregated across the team.", spec: "team-wide pattern mining" },
  { title: "Real-time whisper & barge", body: "Managers listen live, whisper prompts only the rep hears, or join the call. New hires ramp in weeks, not months.", spec: "listen · whisper · barge" },
  { title: "Revenue attribution", body: "Every booked appointment traces back to the call, campaign and list that produced it, per rep and per client.", spec: "call → deal reporting" },
  { title: "AI voice & SMS agents", body: "Autonomous agents qualify inbound calls, revive cold lists and book appointments onto rep calendars, with a human handoff the moment a lead gets serious.", spec: "agency & enterprise plans", callout: true },
];

export function AiIntelligence() {
  return (
    <Section surface aria-labelledby="ai-title">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="ai-title"
            eyebrow="02 · AI intelligence"
            title="A coach on every single call"
            description="Every conversation is transcribed, scored and mined for objections, so managers coach from data instead of the three calls they had time to listen to."
          />
          <p className="max-w-[300px] text-[13px] leading-5 text-fg-muted md:text-right">
            Shipping in the AI release. AI suggests and scores; it never changes a disposition or a compliance decision on its own.
          </p>
        </div>
        <FeatureGrid items={aiFeatures} className="mt-12 lg:grid-cols-3" />
      </Container>
    </Section>
  );
}

/* ── 03 CRM & workflow ────────────────────────────────────────────────── */

const integrations: { name: string; native?: boolean }[] = [
  { name: "GoHighLevel", native: true },
  { name: "HubSpot", native: true },
  { name: "Salesforce", native: true },
  { name: "Zapier" },
  { name: "Webhooks + REST API" },
  { name: "ServiceTitan" },
  { name: "Housecall Pro" },
  { name: "Meta Lead Ads" },
  { name: "Google Sheets" },
  { name: "Slack" },
];

const syncLog: [string, string, string, string][] = [
  ["14:02:09", "form.submitted", "Rachel Donovan", "queued · fresh"],
  ["14:02:15", "call.answered", "L1 · (303) 555-0101", "bridged"],
  ["14:06:41", "disposition", "appointment · Sat 11:00", "→ GHL 1.8s"],
  ["14:06:42", "calendar", "Consults — Denver", "→ GHL 0.9s"],
  ["14:06:42", "tag", "booked-consult", "→ GHL 0.7s"],
];

function IntegrationChip({ name, native }: { name: string; native?: boolean }) {
  return (
    <span
      className={
        native
          ? "inline-block whitespace-nowrap rounded-full border border-brand px-3.5 py-1.5 text-[13.5px] leading-5 font-medium text-brand-text"
          : "inline-block whitespace-nowrap rounded-full border border-border-strong bg-surface px-3.5 py-1.5 text-[13.5px] leading-5 text-fg"
      }
    >
      {name}
      {native && <span className="text-fg-muted"> · native</span>}
    </span>
  );
}

export function IntegrationChips({ className }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {integrations.map((i) => (
        <li key={i.name}>
          <IntegrationChip {...i} />
        </li>
      ))}
    </ul>
  );
}

export function CrmWorkflow() {
  return (
    <Section aria-labelledby="crm-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              id="crm-title"
              eyebrow="03 · CRM & workflow"
              title="Native sync, no Zapier tax"
              description="Contacts, dispositions, recordings and appointments write back to your CRM in real time, both directions, with no middleware to babysit."
            />
            <Reveal>
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {[
                ["Two-way CRM sync", "Stage changes in the CRM update the dial queue; dispositions in DialBrio update the CRM.", "<5s sync latency"],
                ["Built-in SMS & email", "Text and email from the same screen as the dialer, with templates and the full conversation on the contact.", "unified conversation view"],
                ["Calendar booking", "Book onto rep calendars mid-call with round-robin routing, buffers and reminder sequences that cut no-shows.", "round-robin + reminders"],
              ].map(([t, d, s]) => (
                <div key={t} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-[15px] font-semibold text-fg">{t}</dt>
                  <dd className="flex flex-col gap-2 text-[14.5px] leading-[1.6] text-fg-secondary">
                    {d}
                    <SpecChip>{s}</SpecChip>
                  </dd>
                </div>
              ))}
            </dl>
            </Reveal>
          </div>
          <div className="flex min-w-0 flex-col gap-6 lg:pt-16">
            <Reveal delay={0.1}>
            <figure className="dark overflow-hidden rounded-xl bg-background text-fg shadow-lg">
              <figcaption className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px]">
                <span className="font-medium">Sync log · Summit Solar</span>
                <span className="font-mono text-xs text-fg-muted">GoHighLevel</span>
              </figcaption>
              <ol className="divide-y divide-border font-mono text-[12px] leading-5">
                {syncLog.map(([t, ev, subject, res]) => (
                  <li key={t + ev} className="grid grid-cols-[64px_1fr] gap-x-3 px-4 py-2.5 sm:grid-cols-[64px_110px_1fr_auto]">
                    <span className="text-fg-muted">{t}</span>
                    <span className="text-fg-secondary">{ev}</span>
                    <span className="truncate text-fg max-sm:col-start-2">{subject}</span>
                    <span className="text-brand-text max-sm:col-start-2">{res}</span>
                  </li>
                ))}
              </ol>
            </figure>
            </Reveal>
            <div>
              <p className="mb-3 text-[13px] text-fg-muted">Connects to</p>
              <Marquee
                label="Integrations"
                fallback={<IntegrationChips />}
                items={integrations.map((i) => ({ key: i.name, label: i.native ? `${i.name}, native` : i.name, node: <IntegrationChip {...i} /> }))}
              />
              <p className="mt-3 text-[12.5px] text-fg-muted">GoHighLevel ships first. HubSpot and Salesforce adapters are next on the roadmap.</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ── 04 Compliance ────────────────────────────────────────────────────── */

const checks = [
  ["DNC · federal", "clear"],
  ["DNC · state (TX)", "clear"],
  ["DNC · internal list", "clear"],
  ["Consent source", "web form · 14:02"],
  ["Calling hours · America/Chicago", "10:07 · open"],
  ["Caller ID reputation", "healthy · A attestation"],
];

export function Compliance() {
  return (
    <section aria-labelledby="compliance-title" className="bg-background px-3 py-4 sm:px-4">
      <InkPanel className="mx-auto max-w-[1400px] py-20 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16">
            <div>
              <SectionHeading
                id="compliance-title"
                eyebrow="04 · Compliance"
                title="Enforced by the system, not the honor system"
              />
              <RevealStatement text="Included on every plan, because a TCPA suit costs more than any dialer subscription." className="mt-6 max-w-[680px]" />
              <div className="mt-10 grid gap-8 md:grid-cols-3">
                {[
                  ["DNC & consent", "Federal, state and internal do-not-call lists are checked before every dial. Contacts without valid consent can't be queued.", "blocked at dial time"],
                  ["Calling-hours guardrails", "Time-zone-aware windows apply federal and stricter state rules, so reps never have to remember which state stops at 8 p.m.", "per-state rules"],
                  ["Audit trail & retention", "Immutable logs of consent source, dial attempts, recordings and opt-outs. Exportable when your lawyer asks.", "export-ready logs"],
                ].map(([t, d, s], i) => (
                  <Reveal key={t} delay={i * 0.08} className="flex flex-col gap-2 border-t border-border pt-4">
                    <h3 className="text-[16px] font-semibold text-fg">{t}</h3>
                    <p className="text-[14px] leading-[1.6] text-fg-secondary">{d}</p>
                    <SpecChip className="mt-1">{s}</SpecChip>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.1} className="self-start">
            <figure className="rounded-xl border border-border bg-surface p-5" aria-label="Example dial-time compliance check, all checks passed.">
              <figcaption className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                <span className="text-[14px] font-medium text-fg">Before dialing (512) 555-0136</span>
                <span className="font-mono text-xs text-fg-muted">38 ms</span>
              </figcaption>
              <ul className="mt-2 divide-y divide-border">
                {checks.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                    <span className="flex items-center gap-2 text-fg-secondary">
                      <Check className="size-3.5 text-brand-text" aria-hidden /> {k}
                    </span>
                    <span className="font-mono text-xs text-fg">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-[13px] font-medium text-brand-text">Cleared to dial</p>
            </figure>
            </Reveal>
          </div>
        </Container>
      </InkPanel>
    </section>
  );
}

/* ── 05 For agencies ──────────────────────────────────────────────────── */

const clients = [
  ["Summit Solar", "24,610", "$423", "$738"],
  ["Apex Home Services", "12,440", "$217", "$365"],
  ["Brightline Insurance", "8,150", "$134", "$219"],
  ["Cedar Dental Group", "5,020", "$88", "$152"],
];

export function Agencies() {
  return (
    <Section aria-labelledby="agency-title" className="pt-20 md:pt-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_520px] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              id="agency-title"
              eyebrow="05 · For agencies"
              title="Run every client from one pane of glass"
              description="Multi-tenant from the ground up: your brand on the portal, your margin on the minutes, your dashboard across every client."
            />
            <Reveal className="mt-10 flex flex-col gap-4">
              <FeatureCard f={{ title: "Unlimited sub-accounts", body: "Isolated workspaces per client, with separate numbers, lists, agents and reporting, managed from one agency dashboard.", spec: "no per-client fee" }} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureCard f={{ title: "White-label portal", body: "Your logo, colors and domain. Clients log into your calling platform and never see the DialBrio name.", spec: "included, not an add-on" }} />
                <FeatureCard f={{ title: "Client billing & margins", body: "Set your own client prices on seats and minutes. Usage is metered per sub-account and invoiced. You keep the spread.", spec: "built-in rebilling" }} />
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:mt-16">
          <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-md" aria-label="Example agency view: minutes, cost and rebilled amount per client this month.">
            <figcaption className="flex items-baseline justify-between border-b border-border px-5 py-4">
              <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-fg">Clients · September</span>
              <span className="font-mono text-xs text-fg-muted">month to date</span>
            </figcaption>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[13px]">
                <thead>
                  <tr className="text-left text-fg-muted">
                    <th className="px-5 py-2.5 font-medium">Client</th>
                    <th className="px-3 py-2.5 text-right font-medium">Minutes</th>
                    <th className="px-3 py-2.5 text-right font-medium">Your cost</th>
                    <th className="px-5 py-2.5 text-right font-medium">Rebilled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border border-t border-border">
                  {clients.map(([name, min, cost, re]) => (
                    <tr key={name}>
                      <td className="px-5 py-3 text-fg">{name}</td>
                      <td className="px-3 py-3 text-right font-mono text-fg-secondary">{min}</td>
                      <td className="px-3 py-3 text-right font-mono text-fg-secondary">{cost}</td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-fg">{re}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border-strong bg-surface-sunken">
                    <td className="px-5 py-3 font-medium text-fg">Margin this month</td>
                    <td />
                    <td />
                    <td className="px-5 py-3 text-right font-mono font-semibold text-brand-text">+$612</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </figure>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ── Pricing band + final CTA ─────────────────────────────────────────── */

export async function PricingBand() {
  const { plans: allPlans, annualDiscount } = await getPriceBook();
  const plans = allPlans.filter((p) => p.monthlyCents !== null);
  return (
    <Section surface aria-labelledby="pricing-band-title" className="py-16 md:py-20">
      <Reveal>
      <Container className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Eyebrow>Pricing</Eyebrow>
          <h2 id="pricing-band-title" className="mt-3 font-display text-[30px] leading-tight font-bold tracking-[-0.035em] text-fg md:text-[38px]">
            Simple plans. Honest pricing.
          </h2>
          <p className="mt-3 max-w-[560px] text-[16px] leading-[1.6] text-fg-secondary">
            A flat fee per plan and transparent usage: 1.5¢ a minute outbound, $2 a number. Parallel dialing is included on every plan.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
          {plans.map((p) => (
            <div key={p.id}>
              <div className="text-[13px] text-fg-muted">{p.name}</div>
              <div className="font-display text-[32px] leading-none font-bold tracking-[-0.03em] text-fg">
                {formatPlanPrice(p, false, annualDiscount)}
                <span className="font-sans text-[14px] font-normal tracking-normal text-fg-muted">/mo</span>
              </div>
            </div>
          ))}
          <Button asChild variant="secondary" size="lg">
            <Link href="/pricing">
              Compare plans <ArrowRight />
            </Link>
          </Button>
        </div>
      </Container>
      </Reveal>
    </Section>
  );
}

export async function FinalCta() {
  const { trial } = await getPriceBook();
  return (
    <section aria-labelledby="final-cta-title" className="bg-background px-3 pt-4 pb-16 sm:px-4 md:pb-24">
      <Container>
        <Reveal>
        <InkPanel className="flex flex-col gap-8 px-6 py-12 sm:px-12 md:flex-row md:items-center md:justify-between md:py-14">
          <div>
            <h2 id="final-cta-title" className="font-display text-[32px] leading-tight font-bold tracking-[-0.035em] md:text-[40px]">
              See it dial your own list.
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-fg-secondary">
              {trialLine(trial)} · white-glove migration on Agency plans.
            </p>
          </div>
          <Button asChild variant="primary" size="lg" className="shrink-0">
            <Link href="/waitlist">
              Join waitlist <ArrowRight />
            </Link>
          </Button>
        </InkPanel>
        </Reveal>
      </Container>
    </section>
  );
}
