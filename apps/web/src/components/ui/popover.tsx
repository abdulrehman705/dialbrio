"use client";

import * as React from "react";
import { Popover as P } from "radix-ui";
import { cn } from "@/lib/utils";

export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;
export const PopoverClose = P.Close;

export function PopoverContent({ className, sideOffset = 6, align = "end", ...props }: React.ComponentProps<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content
        sideOffset={sideOffset}
        align={align}
        className={cn("z-50 w-80 rounded-lg border border-border bg-surface-elevated text-fg shadow-lg outline-none data-[state=open]:animate-[menu-in_var(--duration-base)_var(--ease-out)]", className)}
        {...props}
      />
    </P.Portal>
  );
}
