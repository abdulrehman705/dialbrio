"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DemoNote } from "./demo-note";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid work email"),
  company: z.string().trim().min(2, "Enter your company or agency name"),
  teamSize: z.string().min(1, "Choose your team size"),
  crm: z.string().min(1, "Choose your CRM"),
});
type Values = z.infer<typeof schema>;

export function GetStartedForm() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", company: "", teamSize: "", crm: "" } });

  const onSubmit = async () => {
    // Demo only: account creation ships with authentication in Phase 1.
    await new Promise((r) => setTimeout(r, 600));
    router.push("/app");
  };

  const aria = (k: keyof Values) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-desc` : undefined });

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
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="mt-2">
          Start my free trial {!isSubmitting && <ArrowRight />}
        </Button>
      </form>
      <DemoNote>This build opens a sample workspace with demo data. Real trial accounts arrive with sign-up; nothing you enter here is saved.</DemoNote>
      <p className="text-center text-[13px] text-fg-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-text hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
