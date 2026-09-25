import { NextResponse, type NextRequest } from "next/server";
import { client } from "@/sanity/lib/client";
import { waitlistSchema } from "@/lib/validation/waitlist";

/**
 * Stores a waitlist signup as a `waitlistEntry` document in Sanity (read-only list in the Studio).
 * Needs SANITY_API_WRITE_TOKEN (server-only, Editor role). Without it the endpoint refuses with 503
 * instead of pretending the signup was saved.
 */
const error = (status: number, code: string, message: string) => NextResponse.json({ error: { code, message } }, { status });

export async function POST(req: NextRequest) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return error(503, "waitlist_unavailable", "The waitlist isn't accepting signups yet.");

  const body = await req.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) return error(400, "invalid_input", "Check the highlighted fields and try again.");

  const { website, ...entry } = parsed.data;
  // Bots fill the hidden honeypot field; accept silently so they don't retry, but store nothing.
  if (website) return NextResponse.json({ ok: true });

  const email = entry.email.trim().toLowerCase();
  const writer = client.withConfig({ token, useCdn: false });
  try {
    const existing = await writer.fetch<string | null>(`*[_type == "waitlistEntry" && email == $email][0]._id`, { email });
    if (!existing) {
      await writer.create({
        _type: "waitlistEntry",
        name: entry.name,
        email,
        company: entry.company,
        teamSize: entry.teamSize,
        crm: entry.crm,
        planInterest: entry.planInterest,
        submittedAt: new Date().toISOString(),
      });
    }
    // Same response for new and repeat signups, so the endpoint doesn't reveal who is already listed.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] failed to store signup", err instanceof Error ? err.message : err);
    return error(502, "waitlist_store_failed", "We couldn't save your signup. Please try again in a minute.");
  }
}
