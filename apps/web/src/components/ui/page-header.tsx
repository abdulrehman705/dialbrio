import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

/** Page anatomy: title (h1) + one-line description + primary/secondary actions. */
export function PageHeader({ title, description, actions, meta, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[26px] leading-8 font-bold tracking-[-0.03em] text-fg lg:text-[30px] lg:leading-9">{title}</h1>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Standard page container: gutters + max width. */
export function Page({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-5 md:px-6 md:py-6", className)}>{children}</div>;
}
