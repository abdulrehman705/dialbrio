"use client";

import * as React from "react";
import { Switch as S, Checkbox as C, RadioGroup as R } from "radix-ui";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-surface-active before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] lg:before:hidden transition-colors duration-(--duration-fast) data-[state=checked]:bg-brand-solid disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <S.Thumb className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-(--duration-fast) data-[state=checked]:translate-x-[18px]" />
    </S.Root>
  );
}

export function Checkbox({ className, ...props }: React.ComponentProps<typeof C.Root>) {
  return (
    <C.Root
      className={cn(
        "peer inline-flex size-4 shrink-0 items-center justify-center rounded-xs border border-border-strong bg-surface-sunken text-white transition-colors data-[state=checked]:border-brand-solid data-[state=checked]:bg-brand-solid data-[state=indeterminate]:border-brand-solid data-[state=indeterminate]:bg-brand-solid disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <C.Indicator>{props.checked === "indeterminate" ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}</C.Indicator>
    </C.Root>
  );
}

export const RadioGroup = ({ className, ...props }: React.ComponentProps<typeof R.Root>) => <R.Root className={cn("grid gap-2", className)} {...props} />;

export function RadioItem({ className, ...props }: React.ComponentProps<typeof R.Item>) {
  return (
    <R.Item className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-sunken data-[state=checked]:border-brand-solid", className)} {...props}>
      <R.Indicator className="size-2 rounded-full bg-brand-solid" />
    </R.Item>
  );
}
