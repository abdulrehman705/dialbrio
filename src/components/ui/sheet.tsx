"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const overlayClass = "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-[fade-in_var(--duration-base)_ease-out]";

/* ── Sheet / Drawer (side panel) ──────────────────────────────────────── */

interface SheetContentProps extends Omit<React.ComponentProps<typeof D.Content>, "title"> {
  side?: "right" | "left" | "bottom";
  title: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  hideHeader?: boolean;
}

export const Sheet = D.Root;

export function SheetContent({ className, side = "right", children, title, description, header, hideHeader, ...props }: SheetContentProps) {
  return (
    <D.Portal>
      <D.Overlay className={overlayClass} />
      <D.Content
        className={cn(
          "fixed z-50 flex flex-col border-border bg-surface-elevated shadow-lg outline-none",
          side === "right" && "inset-y-0 right-0 w-full max-w-xl border-l data-[state=open]:animate-[sheet-in-right_var(--duration-slow)_var(--ease-out)]",
          side === "left" && "inset-y-0 left-0 w-[min(88vw,300px)] border-r data-[state=open]:animate-[sheet-in-left_var(--duration-slow)_var(--ease-out)]",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t data-[state=open]:animate-[sheet-in-bottom_var(--duration-slow)_var(--ease-out)]",
          className,
        )}
        {...props}
      >
        {hideHeader ? (
          <>
            <D.Title className="sr-only">{title}</D.Title>
            <D.Description className="sr-only">{description ?? String(title)}</D.Description>
          </>
        ) : (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">
              {header ?? (
                <>
                  <D.Title className="text-base font-semibold text-fg">{title}</D.Title>
                  {description && <D.Description className="mt-0.5 text-[13px] text-fg-muted">{description}</D.Description>}
                </>
              )}
              {header && <D.Title className="sr-only">{title}</D.Title>}
              {(header || !description) && <D.Description className="sr-only">{String(description ?? title)}</D.Description>}
            </div>
            <D.Close className="-mr-1 rounded-md p-1.5 text-fg-muted hover:bg-surface-hover hover:text-fg max-lg:p-2.5" aria-label="Close panel">
              <X className="size-4" />
            </D.Close>
          </div>
        )}
        {children}
      </D.Content>
    </D.Portal>
  );
}
