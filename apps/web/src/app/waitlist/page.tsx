import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/marketing/auth-shell";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export const metadata: Metadata = { title: "Join the waitlist", description: "Get early access to DialBrio: parallel dialing, speed-to-lead and native GoHighLevel sync." };

export default function WaitlistPage() {
  return (
    <AuthShell aside="waitlist" title="Join the waitlist" description="We're opening DialBrio to teams in batches. Leave your details and we'll email you when your workspace is ready.">
      <Suspense>
        <WaitlistForm />
      </Suspense>
    </AuthShell>
  );
}
