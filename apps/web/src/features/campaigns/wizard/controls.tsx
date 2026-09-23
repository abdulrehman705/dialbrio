"use client";

import * as React from "react";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-[-0.01em] text-fg">{title}</h2>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
    </div>
  );
}

export function Section({ title, description, children, className }: { title: string; description?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <div>
        <legend className="text-[13px] font-semibold text-fg">{title}</legend>
        {description && <p className="mt-0.5 text-xs text-fg-muted">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-danger-text" role="alert">
      <CircleAlert className="size-3.5" aria-hidden /> {message}
    </p>
  );
}

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
  multi?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** Selectable card used for radio-like and checkbox-like choices. */
export function ChoiceCard({ selected, onSelect, title, description, icon, disabled, badge, multi, className, children }: ChoiceCardProps) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors duration-(--duration-fast) disabled:cursor-not-allowed disabled:opacity-55",
        selected ? "border-brand bg-brand-soft" : "border-border bg-surface hover:border-border-strong hover:bg-surface-hover",
        className,
      )}
    >
      {icon && <span className={cn("mt-0.5 shrink-0 [&_svg]:size-4", selected ? "text-brand-text" : "text-fg-muted")}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-fg">
          {title}
          {badge}
        </span>
        {description && <span className="mt-0.5 block text-xs leading-5 text-fg-muted">{description}</span>}
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center border",
          multi ? "rounded-xs" : "rounded-full",
          selected ? "border-brand-solid bg-brand-solid text-white" : "border-border-strong bg-surface-sunken",
        )}
      >
        {selected && (multi ? <Check className="size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-white" />)}
      </span>
    </button>
  );
}

/** Pill toggle for compact multi-select (lead states, weekdays). */
export function Chip({ selected, onToggle, children, label, disabled }: { selected: boolean; onToggle: () => void; children: React.ReactNode; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 max-lg:h-11 [&_svg]:size-3.5",
        selected ? "border-brand bg-brand-soft text-fg" : "border-border text-fg-secondary hover:bg-surface-hover",
      )}
    >
      {children}
    </button>
  );
}
