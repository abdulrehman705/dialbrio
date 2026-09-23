import type { Metadata } from "next";
import { Compliance, FinalCta } from "@/components/marketing/home";
import { PageHero } from "@/components/marketing/page-hero";
import { Container, Section, SectionHeading } from "@/components/marketing/primitives";

export const metadata: Metadata = { title: "Security & compliance", description: "How DialBrio isolates tenants, protects credentials and keeps an audit trail of consent, dials and opt-outs." };

const controls = [
  ["Tenant isolation", "Every record is scoped to an organization and checked on the server for every request. Client sub-accounts can't see each other."],
  ["Credentials stay server-side", "CRM tokens, telephony keys and payment secrets are encrypted at rest and never sent to the browser."],
  ["Signed webhooks", "Inbound events from your CRM and carrier are signature-verified, stored once, and processed idempotently, so duplicates never create duplicate leads or calls."],
  ["Audit log", "Consent sources, dial attempts, DNC changes, role changes and exports are recorded in an append-only log."],
  ["Access by role", "Admin, manager and agent roles are enforced by the API. SSO and custom retention on Enterprise."],
  ["Careful logging", "Logs carry request and tenant IDs, not transcripts or full phone numbers."],
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security & compliance"
        title="Built for the call your lawyer makes."
        description="How DialBrio is designed to protect your data and your clients' data. These are the controls in our architecture; a formal security review and DPA are available on Enterprise."
      />
      <Section aria-labelledby="controls-title">
        <Container className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
          <SectionHeading id="controls-title" eyebrow="Controls" title="What protects your data" />
          <dl className="grid gap-x-10 border-t border-border sm:grid-cols-2">
            {controls.map(([t, d]) => (
              <div key={t} className="border-b border-border py-5">
                <dt className="text-[16px] font-semibold text-fg">{t}</dt>
                <dd className="mt-1.5 text-[14.5px] leading-[1.6] text-fg-secondary">{d}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
      <div id="compliance">
        <Compliance />
      </div>
      <FinalCta />
    </>
  );
}
