"use client";

import * as React from "react";
import { ArrowRightLeft, Delete, Grid3x3, Mic, MicOff, Pause, PhoneOff } from "lucide-react";
import type { CallState } from "@dialbrio/types";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CallControlsProps {
  state: CallState;
  muted: boolean;
  onToggleMute: () => void;
  keypadOpen: boolean;
  onKeypadOpenChange: (open: boolean) => void;
  dtmf: string;
  onDigit: (digit: string) => void;
  onClearDigits: () => void;
  onEnd: () => void;
  ending?: boolean;
  /** Reason Hold/Transfer are unavailable (honest, not hidden). */
  unavailableReason?: string;
  className?: string;
}

const KEYS = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
] as const;

function ControlButton({
  label,
  icon,
  active,
  disabled,
  onClick,
  shortcut,
  ...rest
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  shortcut?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      aria-keyshortcuts={shortcut}
      disabled={disabled}
      onClick={onClick}
      className="group flex w-full flex-col items-center gap-1.5 rounded-md py-1 text-xs text-fg-secondary disabled:pointer-events-none disabled:text-fg-muted"
      {...rest}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full border border-border-strong bg-surface text-fg transition-colors duration-(--duration-fast) group-hover:bg-surface-sunken group-disabled:border-border group-disabled:text-fg-muted [&_svg]:size-[18px]",
          active && "border-warning bg-warning-soft text-warning-text group-hover:bg-warning-soft",
        )}
      >
        {icon}
      </span>
      <span className="flex items-center gap-1">
        {label}
        {shortcut && <span className="font-mono text-[10px] text-fg-muted max-lg:hidden">{shortcut}</span>}
      </span>
    </button>
  );
}

/** In-call controls: Mute, Keypad (DTMF), Hold, Transfer, End. */
export function CallControls({
  state,
  muted,
  onToggleMute,
  keypadOpen,
  onKeypadOpenChange,
  dtmf,
  onDigit,
  onClearDigits,
  onEnd,
  ending,
  unavailableReason = "Available when Twilio voice is connected (Phase 3)",
  className,
}: CallControlsProps) {
  const connected = state === "connected";
  const live = state === "preparing" || state === "dialing" || state === "ringing" || connected;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-4 gap-1">
        <ControlButton label={muted ? "Unmute" : "Mute"} shortcut="M" icon={muted ? <MicOff /> : <Mic />} active={muted} disabled={!connected} onClick={onToggleMute} />
        <Popover open={keypadOpen && connected} onOpenChange={onKeypadOpenChange}>
          <PopoverTrigger asChild>
            <ControlButton label="Keypad" shortcut="K" icon={<Grid3x3 />} active={false} disabled={!connected} />
          </PopoverTrigger>
          <PopoverContent align="center" side="top" className="w-60 p-3">
            <div className="mb-2 flex h-9 items-center justify-between gap-2 rounded-md bg-surface-sunken px-2.5">
              <span className="truncate font-mono text-sm tracking-widest text-fg" aria-live="polite" aria-label="Tones sent">
                {dtmf || <span className="text-xs tracking-normal text-fg-muted">Tones you send appear here</span>}
              </span>
              {dtmf && (
                <button type="button" aria-label="Clear tones" onClick={onClearDigits} className="text-fg-muted hover:text-fg">
                  <Delete className="size-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Dial pad">
              {KEYS.map(([d, sub]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDigit(d)}
                  aria-label={`Send tone ${d}`}
                  className="flex h-12 flex-col items-center justify-center rounded-md border border-border bg-surface text-fg hover:bg-surface-hover"
                >
                  <span className="text-base leading-none font-medium">{d}</span>
                  <span className="mt-0.5 h-2.5 text-[9px] tracking-widest text-fg-muted">{sub}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Tooltip content={unavailableReason}>
          <span tabIndex={0} className="rounded-md">
            <ControlButton label="Hold" icon={<Pause />} disabled aria-disabled />
          </span>
        </Tooltip>
        <Tooltip content={unavailableReason}>
          <span tabIndex={0} className="rounded-md">
            <ControlButton label="Transfer" icon={<ArrowRightLeft />} disabled aria-disabled />
          </span>
        </Tooltip>
      </div>
      <Button variant="danger" size="lg" className="w-full" disabled={!live} loading={ending} onClick={onEnd} aria-keyshortcuts="Space">
        <PhoneOff /> {connected ? "End call" : "Cancel call"}
        <Kbd className="ml-1 border-white/25 bg-white/10 text-white/80 max-lg:hidden">Space</Kbd>
      </Button>
    </div>
  );
}
