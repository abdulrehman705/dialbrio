"use client";

import * as React from "react";
import { Tooltip as T } from "radix-ui";
import { cn } from "@/lib/utils";

export const TooltipProvider = T.Provider;

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  shortcut?: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, side = "top", align = "center", shortcut, className }: TooltipProps) {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            "z-50 flex max-w-xs items-center gap-2 rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-xs text-fg shadow-md",
            "data-[state=delayed-open]:animate-[fade-in_var(--duration-base)_ease-out]",
            className,
          )}
        >
          {content}
          {shortcut}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
