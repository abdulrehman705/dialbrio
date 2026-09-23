"use client";

import * as React from "react";
import { useForm, type DefaultValues, type FieldValues, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import type { SettingsSection } from "@dialbrio/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states";
import { useSettings, useUpdateSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Loads a settings section into a React Hook Form instance validated by a Zod schema. */
export function useSettingsForm<T extends FieldValues>(section: SettingsSection, schema: z.ZodType<T>, fallback: T) {
  const query = useSettings(section);
  const mutation = useUpdateSettings(section);
  const form = useForm<T>({ resolver: zodResolver(schema as never) as unknown as Resolver<T>, defaultValues: fallback as DefaultValues<T> });

  React.useEffect(() => {
    if (query.data) form.reset({ ...fallback, ...(query.data as Partial<T>) } as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      form.reset(values);
      toast.success("Settings saved");
    } catch {
      toast.error("Settings were not saved", { description: "Check your connection and try again. Nothing was changed." });
    }
  });

  return { form, query, onSubmit, saving: mutation.isPending };
}

interface SettingsFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  query: { isLoading: boolean; isError: boolean; refetch: () => unknown };
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  saving: boolean;
  readOnly?: boolean;
  readOnlyReason?: string;
  children: React.ReactNode;
}

/** Wraps a section form: loading/error states, read-only fieldset, and the sticky dirty-state save bar. */
export function SettingsForm<T extends FieldValues>({ form, query, onSubmit, saving, readOnly, readOnlyReason, children }: SettingsFormProps<T>) {
  const dirty = form.formState.isDirty;

  if (query.isLoading)
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <Skeleton className="h-48" />
        <Skeleton className="h-36" />
      </div>
    );
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} description="These settings could not be loaded." />;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {readOnly && <ReadOnlyNotice reason={readOnlyReason} />}
      <fieldset disabled={readOnly || saving} className="flex min-w-0 flex-col gap-4">
        {children}
      </fieldset>
      <AnimatePresence>
        {dirty && !readOnly && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-strong bg-surface-elevated px-4 py-3 shadow-lg"
            role="region"
            aria-label="Unsaved changes"
          >
            <span className="text-[13px] font-medium text-fg">You have unsaved changes</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => form.reset()} disabled={saving}>
                Discard
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                Save changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export function ReadOnlyNotice({ reason }: { reason?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-surface-sunken px-4 py-3 text-[13px] text-fg-secondary">
      <Lock className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
      {reason ?? "These settings are managed by an admin. You can view them but not change them."}
    </div>
  );
}

export function SettingsCard({ title, description, children, className, actions }: { title: string; description?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <Card className={className}>
      <CardHeader title={title} description={description} actions={actions} />
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

/** Label + description on the left, control on the right (stacks on mobile). */
export function SettingRow({ label, description, htmlFor, children, className }: { label: string; description?: React.ReactNode; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6", className)}>
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs leading-5 text-fg-muted">{description}</p>}
      </div>
      <div className="shrink-0 sm:max-w-[50%]">{children}</div>
    </div>
  );
}

export function DangerZone({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-danger/40">
      <CardHeader title="Danger zone" description="Irreversible or high-impact actions. Each requires confirmation and is written to the audit log." />
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

/** A setting that is designed but not built. States the phase and what it will do; no inert controls. */
export function PlannedCard({ title, phase, description, points }: { title: string; phase: string; description: string; points: string[] }) {
  return (
    <section className="rounded-lg border border-dashed border-border-strong px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[14.5px] font-semibold text-fg">{title}</h3>
        <span className="font-mono text-[11px] text-fg-muted">planned · {phase}</span>
      </div>
      <p className="mt-1 text-[13px] leading-5 text-fg-muted">{description}</p>
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] text-fg-secondary sm:grid-cols-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-fg-muted" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}
