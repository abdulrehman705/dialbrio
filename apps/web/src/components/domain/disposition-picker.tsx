"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { addDays, addHours, format, setHours, setMinutes } from "date-fns";
import { DISPOSITION_CODES, type DispositionCode } from "@dialbrio/types";
import { Input } from "@/components/ui/input";
import { Checkbox, RadioGroup, RadioItem } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DISPOSITION_META } from "./status-config";

export interface DispositionSlot {
  value: string; // ISO start time
  label: string;
}

interface DispositionPickerProps {
  code: DispositionCode | null;
  onCodeChange: (code: DispositionCode) => void;
  callbackAt: string;
  onCallbackAtChange: (v: string) => void;
  slot: string | null;
  onSlotChange: (v: string) => void;
  slots: DispositionSlot[];
  slotsNote?: React.ReactNode;
  dncConfirmed: boolean;
  onDncConfirmedChange: (v: boolean) => void;
  /** Contact phone, shown in the DNC confirmation. */
  phoneLabel?: string;
  disabled?: boolean;
  className?: string;
}

const groupTone = {
  positive: "data-[selected=true]:bg-success-soft",
  retry: "data-[selected=true]:bg-info-soft",
  negative: "data-[selected=true]:bg-warning-soft",
};

const toLocalInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");

/**
 * Nine dispositions (3 × 3: positive / retry / negative) with 1–9 shortcuts.
 * Callback, Appointment and DNC expand inline — never a modal (docs/design.md §20).
 * Keyboard shortcuts are handled by the host screen so they work without focus in the grid.
 */
export function DispositionPicker({
  code,
  onCodeChange,
  callbackAt,
  onCallbackAtChange,
  slot,
  onSlotChange,
  slots,
  slotsNote,
  dncConfirmed,
  onDncConfirmedChange,
  phoneLabel,
  disabled,
  className,
}: DispositionPickerProps) {
  const now = new Date();
  const quick = [
    { label: "In 1 hour", value: toLocalInput(addHours(now, 1)) },
    { label: "Today 5:00 PM", value: toLocalInput(setMinutes(setHours(now, 17), 0)) },
    { label: "Tomorrow 10:00 AM", value: toLocalInput(setMinutes(setHours(addDays(now, 1), 10), 0)) },
  ].filter((q) => new Date(q.value) > now);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div role="group" aria-label="Disposition" className="grid grid-cols-3 overflow-hidden rounded-lg border border-border bg-border [gap:1px]">
        {DISPOSITION_CODES.map((c) => {
          const meta = DISPOSITION_META[c];
          const Icon = meta.icon!;
          const selected = code === c;
          return (
            <button
              key={c}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-keyshortcuts={meta.shortcut}
              data-selected={selected}
              onClick={() => onCodeChange(c)}
              className={cn(
                "group relative flex min-h-[60px] flex-col items-start justify-between gap-1 bg-surface px-2.5 py-2 text-left transition-colors duration-(--duration-fast) hover:bg-surface-sunken disabled:cursor-not-allowed disabled:hover:bg-surface",
                groupTone[meta.group],
                c === "dnc" && "data-[selected=true]:bg-danger-soft",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <Icon
                  className={cn(
                    "size-4",
                    disabled ? "text-fg-muted" : "text-fg-secondary",
                    selected && (meta.group === "positive" ? "text-success-text" : meta.group === "retry" ? "text-info-text" : c === "dnc" ? "text-danger-text" : "text-warning-text"),
                  )}
                  aria-hidden
                />
                <span className="font-mono text-[10px] text-fg-muted max-lg:hidden">{meta.shortcut}</span>
              </span>
              <span className={cn("text-xs leading-tight font-medium", selected ? "text-fg" : disabled ? "text-fg-muted" : "text-fg-secondary")}>{meta.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {code === "callback" && (
          <Expand key="callback">
            <div className="text-[13px] font-semibold text-fg">
              Schedule callback
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quick.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => onCallbackAtChange(q.value)}
                  aria-pressed={callbackAt === q.value}
                  className="h-7 rounded-[5px] border border-border px-2.5 text-xs text-fg-secondary hover:border-border-strong hover:text-fg aria-pressed:border-brand aria-pressed:bg-brand-soft aria-pressed:text-brand-text max-lg:h-10"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <label htmlFor="callback-at" className="sr-only">
              Callback date and time
            </label>
            <Input id="callback-at" type="datetime-local" value={callbackAt} min={toLocalInput(now)} onChange={(e) => onCallbackAtChange(e.target.value)} className="font-mono text-[13px]" />
            <p className="text-xs text-fg-muted">Called in the contact&apos;s time zone, inside the campaign calling window.</p>
          </Expand>
        )}

        {code === "appointment" && (
          <Expand key="appointment">
            <div className="text-[13px] font-semibold text-fg">
              Book appointment
            </div>
            <RadioGroup value={slot ?? ""} onValueChange={onSlotChange} aria-label="Appointment time" className="gap-1.5">
              {slots.map((s) => (
                <label
                  key={s.value}
                  className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md border border-border px-2.5 text-[13px] text-fg-secondary hover:bg-surface-hover has-[[data-state=checked]]:border-success has-[[data-state=checked]]:bg-success-soft has-[[data-state=checked]]:text-fg max-lg:min-h-11"
                >
                  <RadioItem value={s.value} />
                  <span className="font-mono tabular">{s.label}</span>
                </label>
              ))}
            </RadioGroup>
            {slotsNote && <p className="text-xs text-fg-muted">{slotsNote}</p>}
          </Expand>
        )}

        {code === "dnc" && (
          <Expand key="dnc" danger>
            <div className="text-[13px] font-semibold text-danger-text">
              Add to Do Not Call
            </div>
            <p className="text-xs leading-5 text-fg-secondary">
              This number will never be dialed or texted again by any campaign in this organization. Removal requires an admin and is audited.
            </p>
            <label className="flex cursor-pointer items-start gap-2 text-[13px] text-fg">
              <Checkbox checked={dncConfirmed} onCheckedChange={(v) => onDncConfirmedChange(v === true)} className="mt-0.5" />
              <span>
                The contact asked not to be called{phoneLabel ? <> — add <span className="font-mono">{phoneLabel}</span> to DNC</> : null}
              </span>
            </label>
          </Expand>
        )}
      </AnimatePresence>
    </div>
  );
}

function Expand({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className={cn("flex flex-col gap-2.5 rounded-lg p-3", danger ? "bg-danger-soft" : "bg-surface-sunken")}>{children}</div>
    </motion.div>
  );
}
