"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DemoNote } from "./demo-note";

const schema = z.object({
  email: z.email("Enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [ssoLoading, setSsoLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", remember: true } });

  const onSubmit = async () => {
    // Demo only: authentication (HTTP-only session cookie) ships in Phase 1.
    await new Promise((r) => setTimeout(r, 500));
    router.push("/app");
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        loading={ssoLoading}
        onClick={() => {
          setSsoLoading(true);
          setTimeout(() => router.push("/app"), 500);
        }}
      >
        {!ssoLoading && <KeyRound />} Continue with SSO
      </Button>

      <div className="flex items-center gap-3 text-xs text-fg-muted">
        <Separator className="flex-1" />
        or sign in with email
        <Separator className="flex-1" />
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            leadingIcon={<Mail />}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-desc" : undefined}
            {...register("email")}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-desc" : undefined}
            {...register("password")}
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="remember" className="flex min-h-11 items-center gap-2 text-[13px] text-fg-secondary lg:min-h-0">
            <Checkbox id="remember" checked={watch("remember")} onCheckedChange={(v) => setValue("remember", v === true)} />
            Keep me signed in
          </label>
          <button
            type="button"
            className="min-h-11 text-[13px] font-medium text-brand-text hover:underline lg:min-h-0"
            onClick={() => toast("Password reset arrives with authentication", { description: "This environment is a product demo." })}
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="mt-2">
          Sign in
        </Button>
      </form>

      <DemoNote>
        This build uses demo sign-in: any valid email and an 8+ character password opens the sample workspace.
      </DemoNote>
      <p className="text-center text-[13px] text-fg-muted">
        New to DialBrio?{" "}
        <Link href="/waitlist" className="font-medium text-brand-text hover:underline">
          Join the waitlist
        </Link>
      </p>
    </div>
  );
}
