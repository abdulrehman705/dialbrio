"use client";

import * as React from "react";
import { ToggleGroup } from "radix-ui";
import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  value: T;
  onValueChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[];
  label: string;
  className?: string;
  size?: "sm" | "md";
}

/** Single-select segmented control (filters, ranges). Not a tab — does not own content panels. */
export function Segmented<T extends string>({ value, onValueChange, options, label, className, size = "sm" }: SegmentedProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      aria-label={label}
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-surface-sunken p-0.5", size === "sm" ? "h-8" : "h-9", className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap text-fg-muted transition-colors hover:text-fg data-[state=on]:bg-surface data-[state=on]:text-fg data-[state=on]:shadow-sm [&_svg]:size-3.5",
            size === "sm" ? "h-7" : "h-8",
          )}
        >
          {o.icon}
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
