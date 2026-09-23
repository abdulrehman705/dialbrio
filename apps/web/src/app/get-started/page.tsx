import type { Metadata } from "next";
import { AuthShell } from "@/components/marketing/auth-shell";
import { GetStartedForm } from "@/components/marketing/get-started-form";

export const metadata: Metadata = { title: "Start free trial" };

export default function GetStartedPage() {
  return (
    <AuthShell aside="trial" title="Start your free trial" description="14 days, 500 free minutes, no credit card. Takes under a minute.">
      <GetStartedForm />
    </AuthShell>
  );
}
