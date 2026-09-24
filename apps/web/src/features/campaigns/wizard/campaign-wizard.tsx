"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Rocket, Save } from "lucide-react";
import { toast } from "sonner";
import { useCreateCampaign } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Page, PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { campaignDefaults, campaignSchema, type CampaignFormValues } from "../schema";
import { StepAgents, StepNumbers } from "./step-assign";
import { StepReview } from "./step-review";
import { StepCallingRules, StepDispositions, StepFollowUp } from "./step-rules";
import { StepBasics, StepLeadSource, StepQueue } from "./step-setup";
import { STEPS } from "./steps";

function firstStepWithError(errors: FieldErrors<CampaignFormValues>) {
  const keys = Object.keys(errors);
  return STEPS.findIndex((s) => s.fields.some((f) => keys.includes(f.split(".")[0]!)));
}

export function CampaignWizard() {
  const router = useRouter();
  const create = useCreateCampaign();
  const form = useForm<CampaignFormValues>({ resolver: zodResolver(campaignSchema), defaultValues: campaignDefaults, mode: "onTouched" });
  const [step, setStep] = React.useState(0);
  const [reached, setReached] = React.useState(0);
  const [pendingAction, setPendingAction] = React.useState<"draft" | "launch" | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isAi = form.watch("dialStrategy") === "ai";
  const last = STEPS.length - 1;
  const current = STEPS[step]!;

  // Warn before discarding unsaved work.
  React.useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !create.isSuccess) e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [form.formState.isDirty, create.isSuccess]);

  const goTo = (i: number) => {
    setStep(i);
    setReached((r) => Math.max(r, i));
    document.getElementById("main")?.scrollTo({ top: 0 });
    requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }));
  };

  const next = async () => {
    const ok = await form.trigger(current.fields, { shouldFocus: true });
    if (ok) goTo(step + 1);
  };

  const submit = (launch: boolean) => (values: CampaignFormValues) => {
    setPendingAction(launch ? "launch" : "draft");
    create.mutate(
      { draft: values, launch },
      {
        onSuccess: (c) => {
          toast.success(launch ? `${c.name} is live` : `${c.name} saved as draft`, {
            description: launch ? "Matching leads are entering the queue now." : "You can finish and launch it any time.",
          });
          router.push(`/app/campaigns?id=${c.id}`);
        },
        onError: () => toast.error("Couldn't save the campaign", { description: "Nothing was created. Try again." }),
        onSettled: () => setPendingAction(null),
      },
    );
  };

  const onInvalid = (errors: FieldErrors<CampaignFormValues>) => {
    const i = firstStepWithError(errors);
    if (i >= 0) {
      goTo(i);
      toast.error(`Fix ${STEPS[i]!.title.toLowerCase()} before launching`);
    }
  };

  const saveDraft = async () => {
    if (!(await form.trigger("name", { shouldFocus: true }))) {
      if (step !== 0) goTo(0);
      toast.error("Name the campaign to save a draft");
      return;
    }
    submit(false)(form.getValues());
  };

  const launch = form.handleSubmit(submit(true), onInvalid);

  return (
    <Page className="max-w-[1280px]">
      <PageHeader
        title="New campaign"
        description="Nine short steps. Drafts can be saved at any point."
        actions={
          <Button asChild variant="ghost">
            <Link href="/app/campaigns">Cancel</Link>
          </Button>
        }
      />

      <FormProvider {...form}>
        <Card className="grid overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Step rail — desktop */}
          <nav aria-label="Campaign setup steps" className="hidden border-r border-border bg-surface-sunken p-3 lg:block">
            <ol className="space-y-0.5">
              {STEPS.map((s, i) => {
                const done = i < reached && i !== step;
                const reachable = i <= reached;
                const active = i === step;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => goTo(i)}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors disabled:cursor-not-allowed",
                        active ? "bg-surface shadow-xs ring-1 ring-border" : reachable ? "hover:bg-surface-hover" : "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold",
                          active ? "border-brand bg-brand-solid text-brand-on" : done ? "border-success bg-success-soft text-success-text" : "border-border-strong text-fg-muted",
                        )}
                      >
                        {done && !active ? <Check className="size-3" strokeWidth={3} aria-label="Completed" /> : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("block text-[13px] font-medium", active ? "text-fg" : "text-fg-secondary")}>{s.title}</span>
                        <span className="block truncate text-xs text-fg-muted">{s.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex min-w-0 flex-col">
            {/* Compact progress — mobile/tablet */}
            <div className="border-b border-border px-4 py-3 lg:hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-fg">
                  Step {step + 1} of {STEPS.length} · {current.title}
                </span>
                {step < last && <span className="text-fg-muted">Next: {STEPS[step + 1]!.title}</span>}
              </div>
              <Progress className="mt-2" value={((step + 1) / STEPS.length) * 100} label={`Step ${step + 1} of ${STEPS.length}`} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step < last) void next();
                else void launch();
              }}
              noValidate
              className="flex min-h-[560px] flex-1 flex-col"
            >
              <div ref={contentRef} tabIndex={-1} className="flex-1 px-4 py-6 outline-none md:px-8 md:py-8" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={step} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
                    {step === 0 && <StepBasics />}
                    {step === 1 && <StepLeadSource />}
                    {step === 2 && <StepQueue />}
                    {step === 3 && <StepCallingRules />}
                    {step === 4 && <StepDispositions />}
                    {step === 5 && <StepFollowUp />}
                    {step === 6 && <StepNumbers />}
                    {step === 7 && <StepAgents />}
                    {step === 8 && <StepReview onEdit={goTo} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-surface px-4 py-3 md:px-8">
                <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>
                  <ArrowLeft /> Back
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button type="button" onClick={saveDraft} loading={pendingAction === "draft"} disabled={create.isPending}>
                    <Save /> <span className="max-sm:sr-only">Save draft</span>
                  </Button>
                  {step < last ? (
                    <Button type="submit" variant="primary">
                      Continue <ArrowRight />
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary" loading={pendingAction === "launch"} disabled={isAi || create.isPending} title={isAi ? "AI voice launches in Phase 6" : undefined}>
                      <Rocket /> Launch campaign
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </Card>
      </FormProvider>
    </Page>
  );
}
