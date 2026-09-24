"use client";

import * as React from "react";
import { Tabs as T } from "radix-ui";
import { cn } from "@/lib/utils";

export const Tabs = T.Root;
export const TabsContent = T.Content;

/** Underline tabs for page/section navigation. */
export function TabsList({ className, ...props }: React.ComponentProps<typeof T.List>) {
  return <T.List className={cn("flex items-center gap-1 overflow-x-auto border-b border-border", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        "relative -mb-px inline-flex h-9 shrink-0 items-center gap-1.5 border-b-2 border-transparent px-2.5 text-[13px] font-medium text-fg-muted transition-colors duration-(--duration-fast) hover:text-fg data-[state=active]:border-brand data-[state=active]:text-fg max-lg:h-11 [&_svg]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

/** Segmented control for switching views/filters within a card. */
export function SegmentedList({ className, ...props }: React.ComponentProps<typeof T.List>) {
  return <T.List className={cn("inline-flex h-8 items-center gap-0.5 rounded-full bg-surface-sunken p-0.5", className)} {...props} />;
}

export function SegmentedTrigger({ className, ...props }: React.ComponentProps<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-fg-muted transition-colors hover:text-fg data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-sm [&_svg]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}
