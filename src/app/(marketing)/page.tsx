import type { Metadata } from "next";
import { Agencies, AiIntelligence, Compliance, CrmWorkflow, DialingEngine, FinalCta, Hero, PricingBand } from "@/components/marketing/home";

export const metadata: Metadata = {
  title: { absolute: "DialBrio — the power dialer that keeps reps talking" },
  description:
    "Parallel dialing, sub-10-second speed-to-lead and native GoHighLevel and HubSpot sync for sales teams and agencies. 14-day free trial, 500 free minutes, no card.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <DialingEngine />
      <AiIntelligence />
      <CrmWorkflow />
      <Compliance />
      <Agencies />
      <PricingBand />
      <FinalCta />
    </>
  );
}
