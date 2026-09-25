import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-xs font-medium tracking-[0.01em] text-fg-secondary", className)} {...props} />;
}

interface FieldProps {
  label: React.ReactNode;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
  optional?: boolean;
}

/** Label above, control, then hint or error. Wire `aria-describedby` on the control to `${htmlFor}-desc`. */
export function Field({ label, htmlFor, hint, error, className, children, optional }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {optional && <span className="ml-1 font-normal text-fg-muted">(optional)</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-desc`} className="flex items-center gap-1.5 text-xs text-danger-text" role="alert">
          <CircleAlert className="size-3.5" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-desc`} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
