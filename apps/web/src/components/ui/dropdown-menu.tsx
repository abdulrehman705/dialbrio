"use client";

import * as React from "react";
import { DropdownMenu as M } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;
export const DropdownMenuGroup = M.Group;
export const DropdownMenuRadioGroup = M.RadioGroup;

export const menuContentClass =
  "z-50 min-w-48 overflow-hidden rounded-lg border border-border bg-surface-elevated p-1 text-sm text-fg shadow-lg outline-none data-[state=open]:animate-[menu-in_var(--duration-base)_var(--ease-out)]";
export const menuItemClass =
  "relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-md px-2 text-[13px] text-fg outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-surface-hover max-lg:h-11 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-muted";

export function DropdownMenuContent({ className, sideOffset = 6, align = "end", ...props }: React.ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content sideOffset={sideOffset} align={align} className={cn(menuContentClass, className)} {...props} />
    </M.Portal>
  );
}

export function DropdownMenuItem({ className, destructive, ...props }: React.ComponentProps<typeof M.Item> & { destructive?: boolean }) {
  return <M.Item className={cn(menuItemClass, destructive && "text-danger-text [&_svg]:text-danger-text", className)} {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof M.RadioItem>) {
  return (
    <M.RadioItem className={cn(menuItemClass, "pr-8", className)} {...props}>
      {children}
      <M.ItemIndicator className="absolute right-2">
        <Check className="!text-brand" />
      </M.ItemIndicator>
    </M.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof M.Label>) {
  return <M.Label className={cn("px-2 pt-2 pb-1 text-xs font-medium text-fg-muted", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}
