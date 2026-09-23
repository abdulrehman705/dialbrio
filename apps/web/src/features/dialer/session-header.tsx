"use client";

import { Keyboard } from "lucide-react";
import type { DialerSession, ParallelLines } from "@dialbrio/types";
import { CallStatus, NumberHealth } from "@/components/domain";
import { NUMBER_HEALTH_META } from "@/components/domain/status-config";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { cn, formatClock, formatPhone } from "@/lib/utils";
import { useDialerStore } from "./store";
import { useNow } from "./use-now";

const SHORTCUTS: [string, string][] = [
  ["Space", "Call / end call"],
  ["M", "Mute / unmute"],
  ["K", "Open keypad"],
  ["V", "Drop voicemail"],
  ["1 – 9", "Choose outcome"],
  ["⌘ ↵", "Save & next lead"],
];

const MODE_LABEL: Record<DialerSession["campaign"]["dialMode"], string> = {
  preview: "Preview dial",
  power: "Power dial",
  parallel: "Parallel dial",
  progressive: "Progressive dial",
};

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="text-xs text-fg-muted">{label}</span>
      <span className="text-[15px] font-semibold text-fg tabular">{value}</span>
    </div>
  );
}

export function ShortcutsHint({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={className} aria-label="Keyboard shortcuts">
          <Keyboard /> <span className="max-2xl:hidden">Shortcuts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <p className="mb-2 text-[13px] font-semibold text-fg">Dialer shortcuts</p>
        <dl className="flex flex-col gap-1.5">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k} className="flex items-center justify-between gap-3 text-[13px]">
              <dt className="text-fg-secondary">{d}</dt>
              <dd>
                <Kbd>{k}</Kbd>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-fg-muted">Shortcuts pause while you type in a field.</p>
      </PopoverContent>
    </Popover>
  );
}

interface SessionHeaderProps {
  session: DialerSession;
  onCallerIdChange: (n: string) => void;
  onLinesChange: (lines: ParallelLines) => void;
  /** Caller ID and lines can't change mid-call. */
  locked: boolean;
}

export function SessionHeader({ session, onCallerIdChange, onLinesChange, locked }: SessionHeaderProps) {
  const callState = useDialerStore((s) => s.callState);
  const autoDial = useDialerStore((s) => s.autoDial);
  const set = useDialerStore((s) => s.set);
  const now = useNow();
  const elapsed = (now - new Date(session.startedAt).getTime()) / 1000;
  const current = session.callerIds.find((c) => c.number === session.callerId);
  const lineOptions = ([1, 2, 3, 4] as ParallelLines[]).filter((n) => n <= session.maxLines);

  return (
    <div className="border-b border-border bg-surface">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[17px] leading-6 font-bold tracking-[-0.02em] text-fg">{session.campaign.name}</h2>
            <p className="truncate text-xs text-fg-muted">
              {session.lines > 1 ? `Parallel dial · ${session.lines} lines` : MODE_LABEL[session.campaign.dialMode]} · {session.queueName} ·{" "}
              <span className="text-fg-secondary tabular">{session.queueWaiting}</span> waiting
            </p>
          </div>
          <CallStatus state={callState} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="caller-id" className="text-xs text-fg-muted max-xl:sr-only">
              Caller ID
            </label>
            <Select
              id="caller-id"
              size="sm"
              className="w-[10.25rem] font-mono"
              value={session.callerId}
              onValueChange={onCallerIdChange}
              disabled={locked}
              aria-label="Caller ID"
              options={session.callerIds.map((c) => ({ value: c.number, label: formatPhone(c.number), description: `${c.label} · ${NUMBER_HEALTH_META[c.health].label}` }))}
            />
            {current && current.health !== "healthy" && <NumberHealth health={current.health} size="sm" />}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted max-xl:sr-only" id="lines-label">
              Lines
            </span>
            <Tooltip
              content={
                locked
                  ? "Lines can't change during a call."
                  : "Dial up to 4 numbers at once. Answering-machine detection drops voicemails and the first live answer is bridged to you."
              }
              className="max-w-64"
            >
              <span>
                <Segmented
                  label="Parallel lines"
                  value={String(session.lines)}
                  onValueChange={(v) => !locked && onLinesChange(Number(v) as ParallelLines)}
                  options={lineOptions.map((n) => ({ value: String(n), label: String(n) }))}
                  className={cn(locked && "pointer-events-none opacity-60")}
                />
              </span>
            </Tooltip>
            <span className="rounded-[5px] bg-brand-soft px-2 py-1 font-mono text-[11px] text-brand-text max-md:hidden">AMD &lt; 1s</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="max-lg:hidden">
            <Stat label="Session" value={<span className="font-mono text-[14px]">{formatClock(elapsed)}</span>} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-fg-secondary">
            <Switch checked={autoDial} onCheckedChange={(v) => set({ autoDial: v, autoDialAt: v ? useDialerStore.getState().autoDialAt : null })} aria-label="Auto-dial next lead" />
            Auto-dial
          </label>
          <ShortcutsHint className="max-lg:hidden" />
        </div>
      </div>
    </div>
  );
}
