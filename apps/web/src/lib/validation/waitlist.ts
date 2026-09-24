import { z } from "zod";

/** Waitlist signup. Shared by the form (client) and app/api/waitlist (server). */
export const waitlistSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.email("Enter a valid work email").max(200),
  company: z.string().trim().min(2, "Enter your company or agency name").max(160),
  teamSize: z.enum(["1", "2-10", "11-25", "25+"], { message: "Choose your team size" }),
  crm: z.enum(["ghl", "hubspot", "salesforce", "other"], { message: "Choose your CRM" }),
  planInterest: z.enum(["solo", "team", "agency", "enterprise"]).optional(),
  /** Honeypot: hidden from people, filled by bots. Must stay empty. */
  website: z.string().max(0).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
