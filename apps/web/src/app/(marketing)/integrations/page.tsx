import type { Metadata } from "next";
import { CrmWorkflow, FinalCta, IntegrationChips } from "@/components/marketing/home";
import { PageHero } from "@/components/marketing/page-hero";
import { Container, Section, SectionHeading } from "@/components/marketing/primitives";

export const metadata: Metadata = { title: "Integrations", description: "Native two-way GoHighLevel sync, with HubSpot and Salesforce next. Webhooks and REST API for everything else." };

const rows = [
  ["GoHighLevel", "Native, two-way", "Contacts, custom fields, tags, notes, calendars, appointments", "Available first"],
  ["HubSpot", "Native, two-way", "Contacts, deals, notes, meetings", "Roadmap"],
  ["Salesforce", "Native, two-way", "Leads, contacts, tasks, events", "Roadmap"],
  ["Meta Lead Ads", "Trigger", "New lead → instant dial", "Roadmap"],
  ["Zapier · Webhooks · REST", "Open", "Anything else, with signed webhooks", "Roadmap"],
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Your CRM stays the source of truth."
        description="DialBrio reads leads in and writes outcomes back, both directions, with no middleware to babysit. The CRM adapter is swappable, so switching CRMs doesn't mean rebuilding your process."
      />
      <Section aria-labelledby="int-title">
        <Container>
          <SectionHeading id="int-title" eyebrow="Connections" title="What connects, and how deeply" />
          <IntegrationChips className="mt-8" />
          <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[680px] text-[14px]">
              <caption className="sr-only">Integration depth and availability</caption>
              <thead className="border-b border-border">
                <tr className="text-left font-mono text-[11.5px] tracking-[0.06em] text-fg-muted uppercase">
                  <th scope="col" className="px-5 py-3 font-medium">Integration</th>
                  <th scope="col" className="px-5 py-3 font-medium">Type</th>
                  <th scope="col" className="px-5 py-3 font-medium">What syncs</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(([n, t, w, s]) => (
                  <tr key={n}>
                    <th scope="row" className="px-5 py-4 text-left font-semibold text-fg">{n}</th>
                    <td className="px-5 py-4 text-fg-secondary">{t}</td>
                    <td className="px-5 py-4 text-fg-secondary">{w}</td>
                    <td className={s === "Available first" ? "px-5 py-4 font-medium text-brand-text" : "px-5 py-4 text-fg-muted"}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
      <CrmWorkflow />
      <FinalCta />
    </>
  );
}
