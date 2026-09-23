import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex h-[21px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[5px] px-1.5 text-xs font-medium leading-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-soft text-neutral-text",
        brand: "bg-brand-soft text-brand-text",
        success: "bg-success-soft text-success-text",
        warning: "bg-warning-soft text-warning-text",
        danger: "bg-danger-soft text-danger-text",
        info: "bg-info-soft text-info-text",
        ai: "bg-ai-soft text-ai-text",
        fresh: "bg-lead-fresh-soft text-lead-fresh-text",
        warm: "bg-lead-warm-soft text-lead-warm-text",
        aged: "bg-lead-aged-soft text-lead-aged-text",
        zombie: "bg-lead-zombie-soft text-lead-zombie-text",
        outline: "border border-border text-fg-secondary",
      },
      size: { sm: "h-5 px-1.5 text-[11px]", md: "" },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
