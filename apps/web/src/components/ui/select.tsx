"use client";

import * as React from "react";
import { Select as S } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  options: { value: string; label: React.ReactNode; description?: string }[];
  placeholder?: string;
  id?: string;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}

export function Select({ value, defaultValue, onValueChange, options, placeholder, id, className, size = "md", disabled, ...aria }: SelectProps) {
  return (
    <S.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
      <S.Trigger
        id={id}
        aria-label={aria["aria-label"]}
        aria-invalid={aria["aria-invalid"]}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2 rounded-[10px] border border-border-input bg-surface px-3 text-left text-sm text-fg outline-none transition-[border-color,box-shadow] focus-visible:border-fg focus-visible:ring-2 focus-visible:ring-fg/15 disabled:opacity-50 data-placeholder:text-fg-muted aria-invalid:border-danger",
          size === "sm" ? "h-8 text-[13px]" : "h-9 max-lg:h-11",
          className,
        )}
      >
        <span className="truncate">
          <S.Value placeholder={placeholder} />
        </span>
        <S.Icon>
          <ChevronDown className="size-4 text-fg-muted" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content position="popper" sideOffset={4} className="z-50 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-border bg-surface-elevated p-1 shadow-lg">
          <S.Viewport>
            {options.map((o) => (
              <S.Item
                key={o.value}
                value={o.value}
                className="relative flex min-h-8 cursor-pointer select-none flex-col justify-center rounded-md py-1.5 pr-8 pl-2 text-[13px] text-fg outline-none data-highlighted:bg-surface-hover max-lg:min-h-11"
              >
                <S.ItemText>{o.label}</S.ItemText>
                {o.description && <span className="text-xs text-fg-muted">{o.description}</span>}
                <S.ItemIndicator className="absolute top-1/2 right-2 -translate-y-1/2">
                  <Check className="size-4 text-brand" />
                </S.ItemIndicator>
              </S.Item>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  );
}
