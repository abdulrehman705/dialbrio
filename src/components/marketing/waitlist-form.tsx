"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { APP_LOGIN_URL } from "@/lib/links";
import { waitlistSchema, type WaitlistInput } from "@/lib/validation/waitlist";

const PLANS = ["solo", "team", "agency", "enterprise"] as const;

export function WaitlistForm() {
  const params = useSearchParams();
  const planParam = params.get("plan");
  const planInterest = PLANS.find((p) => p === planParam);
  const [status, setStatus] = React.useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { name: "", email: "", company: "", planInterest, website: "" },
  });

  const onSubmit = async (values: WaitlistInput) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (res.ok) return setStatus("done");
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setMessage(body?.error?.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setMessage("You appear to be offline. Check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-xl border border-border bg-surface-sunken p-6">
        <CircleCheck className="size-6 text-success" aria-hidden />
        <div>
          <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-fg">You&apos;re on the list.</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-fg-secondary">We&apos;ll email you when your workspace is ready. Early access includes the 14-day trial and 500 free minutes.</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/">Back to the site</Link>
        </Button>
      </div>
    );
  }

  const aria = (k: keyof WaitlistInput) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-desc` : undefined });

  return (
    <div className="flex flex-col gap-6">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...aria("name")} {...register("name")} />
        </Field>
        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...aria("email")} {...register("email")} />
        </Field>
        <Field label="Company or agency" htmlFor="company" error={errors.company?.message}>
          <Input id="company" autoComplete="organization" {...aria("company")} {...register("company")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Agents" htmlFor="teamSize" error={errors.teamSize?.message}>
            <Controller
              control={control}
              name="teamSize"
              render={({ field }) => (
                <Select
                  id="teamSize"
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  placeholder="Select"
                  aria-invalid={!!errors.teamSize}
                  options={[
                    { value: "1", label: "Just me" },
                    { value: "2-10", label: "2–10" },
                    { value: "11-25", label: "11–25" },
                    { value: "25+", label: "25+" },
                  ]}
                />
              )}
            />
          </Field>
          <Field label="CRM" htmlFor="crm" error={errors.crm?.message}>
            <Controller
              control={control}
              name="crm"
              render={({ field }) => (
                <Select
                  id="crm"
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  placeholder="Select"
                  aria-invalid={!!errors.crm}
                  options={[
                    { value: "ghl", label: "GoHighLevel" },
                    { value: "hubspot", label: "HubSpot", description: "Planned" },
                    { value: "salesforce", label: "Salesforce", description: "Planned" },
                    { value: "other", label: "Other" },
                  ]}
                />
              )}
            />
          </Field>
        </div>
        {/* Honeypot: invisible to people and screen readers; bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
        {status === "error" && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-[13.5px] text-danger-text">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {message}
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="mt-2">
          Join the waitlist {!isSubmitting && <ArrowRight />}
        </Button>
      </form>
      {APP_LOGIN_URL && (
        <p className="text-center text-[13px] text-fg-muted">
          Already have access?{" "}
          <a href={APP_LOGIN_URL} className="font-medium text-brand-text hover:underline">
            Log in
          </a>
        </p>
      )}
    </div>
  );
}
