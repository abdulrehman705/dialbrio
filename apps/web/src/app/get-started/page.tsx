import { redirect } from "next/navigation";

/** Replaced by the waitlist. Kept as a redirect so existing links (and ?plan=) keep working. */
export default async function GetStartedPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  redirect(plan ? `/waitlist?plan=${encodeURIComponent(plan)}` : "/waitlist");
}
