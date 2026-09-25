"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

const overlayClass = "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-[fade-in_var(--duration-base)_ease-out]";

interface DialogContentProps extends Omit<React.ComponentProps<typeof D.Content>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  hideTitle?: boolean;
}

export function DialogContent({ className, children, title, description, hideTitle, ...props }: DialogContentProps) {
  return (
    <D.Portal>
      <D.Overlay className={overlayClass} />
      <D.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-surface-elevated shadow-lg outline-none",
          "data-[state=open]:animate-[dialog-in_var(--duration-slow)_var(--ease-out)]",
          className,
        )}
        {...props}
      >
        <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 pb-3", hideTitle && "sr-only")}>
          <div>
            <D.Title className="text-base font-semibold text-fg">{title}</D.Title>
            {description ? <D.Description className="mt-1 text-[13px] text-fg-muted">{description}</D.Description> : <D.Description className="sr-only">{String(title)}</D.Description>}
          </div>
          <D.Close className="-mr-1 rounded-md p-1 text-fg-muted hover:bg-surface-hover hover:text-fg" aria-label="Close">
            <X className="size-4" />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </D.Content>
    </D.Portal>
  );
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-end gap-2 border-t border-border px-5 py-3", className)} {...props} />;
}

/* ── Sheet / Drawer (side panel) ──────────────────────────────────────── */

interface SheetContentProps extends Omit<React.ComponentProps<typeof D.Content>, "title"> {
  side?: "right" | "left" | "bottom";
  title: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  hideHeader?: boolean;
}

export const Sheet = D.Root;
export const SheetTrigger = D.Trigger;
export const SheetClose = D.Close;

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
