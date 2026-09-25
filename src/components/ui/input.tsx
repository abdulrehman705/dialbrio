import * as React from "react";
import { cn } from "@/lib/utils";

export const inputBase =
  "w-full min-w-0 rounded-[10px] border border-border-input bg-surface px-3 text-sm text-fg placeholder:text-fg-muted transition-[border-color,box-shadow] duration-(--duration-fast) outline-none focus-visible:border-fg focus-visible:ring-2 focus-visible:ring-fg/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/20";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function Input({ className, leadingIcon, trailing, ...props }: InputProps) {
  if (!leadingIcon && !trailing) return <input className={cn(inputBase, "h-9 max-lg:h-11", className)} {...props} />;
  return (
    <div className={cn("relative flex items-center", className)}>
      {leadingIcon && (
        <span className="pointer-events-none absolute left-3 text-fg-muted [&_svg]:size-4" aria-hidden>
          {leadingIcon}
        </span>
      )}
      <input className={cn(inputBase, "h-9 max-lg:h-11", leadingIcon && "pl-9", trailing && "pr-10")} {...props} />
      {trailing && <span className="absolute right-2 flex items-center">{trailing}</span>}
    </div>
  );
}
