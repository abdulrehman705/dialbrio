"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Grid3x3, Mic, PhoneOff } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/ui/status-dot";
import { DISPOSITION_META, LeadStateBadge } from "@/components/domain";
import type { DispositionCode } from "@dialbrio/types";
import { cn, formatClock } from "@/lib/utils";
import { TypedLine } from "./motion";

/*
 * Marketing illustration of the Dialer in parallel mode, composed from real design-system components.
 * Static illustrative content (not live data); exposed to assistive tech as a single image.
 */

const lines = [
  { n: 1, who: "Rachel Donovan", detail: "Live answer · bridged to Maya", tone: "connected" as const },
  { n: 2, who: "(720) 555-0122", detail: "Machine detected · skipped", tone: "neutral" as const },
  { n: 3, who: "(303) 555-0133", detail: "No answer · retry in 30 min", tone: "neutral" as const },
];

const transcript = [
  { who: "Maya", agent: true, text: "Do you own the home, and roughly what's the electric bill each month?" },
  { who: "Rachel", agent: false, text: "We own it. It's been around two-twenty since we got the EV." },
  { who: "Maya", agent: true, text: "Thursday at 10 or Saturday at 11 for a free design consult?" },
  { who: "Rachel", agent: false, text: "Saturday at 11. My wife will want to join." },
];

const dispositions: DispositionCode[] = ["interested", "appointment", "callback", "no_answer", "busy", "voicemail", "not_interested", "wrong_number", "dnc"];

function useTicker(start: number) {
  const [t, setT] = React.useState(start);
  React.useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function AudioLevel() {
  const reduce = useReducedMotion();
  const [levels, setLevels] = React.useState([0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.5]);
  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setLevels((l) => l.map(() => 0.2 + Math.random() * 0.8)), 180);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
      {levels.map((l, i) => (
        <span key={i} className="w-[3px] rounded-full bg-call-connected transition-[height] duration-150" style={{ height: `${l * 100}%` }} />
      ))}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-fg-muted">{label}</span>
      <span className="text-[13px] font-semibold text-fg tabular">{value}</span>
    </div>
  );
}

export function HeroProduct({ className }: { className?: string }) {
  const callSec = useTicker(222);
  const sessionSec = useTicker(47 * 60 + 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className={cn("light relative", className)}
    >
      <figure className="overflow-hidden rounded-xl border border-border-strong bg-background text-left shadow-lg">
        <div
          role="img"
          aria-label="DialBrio dialer in 3-line parallel mode: one live answer bridged to the rep, one answering machine skipped automatically, one no-answer scheduled for retry, with live transcript and disposition shortcuts."
        >
          <div inert className="select-none text-fg">
            {/* App chrome */}
            <div className="flex h-10 items-center gap-2.5 bg-sidebar px-3.5">
              <LogoMark size={17} />
              <span className="text-[12px] text-fg-muted">Summit Solar</span>
              <span className="text-[12px] text-fg-muted">/</span>
              <span className="text-[12px] font-medium text-fg">Dialer</span>
              <span className="ml-auto hidden items-center gap-1.5 font-mono text-[11px] text-fg-muted sm:flex">
                session {formatClock(sessionSec)}
              </span>
            </div>

            {/* Session header */}
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-border bg-surface px-4 py-3">
              <div className="min-w-0">
                <span className="block text-[11px] text-fg-muted">Campaign</span>
                <span className="block truncate text-[13px] font-semibold text-fg">Solar Inbound — Web Leads</span>
              </div>
              <div className="hidden sm:block">
                <span className="block text-[11px] text-fg-muted">Caller ID · local</span>
                <span className="block font-mono text-[12.5px] text-fg">(303) 555-0142</span>
              </div>
              <div>
                <span className="block text-[11px] text-fg-muted">Lines</span>
                <span className="mt-0.5 flex gap-0.5 rounded-[6px] bg-surface-sunken p-0.5">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={cn("flex h-5 w-6 items-center justify-center rounded-[4px] font-mono text-[11px]", n === 3 ? "bg-surface font-semibold text-fg shadow-sm" : "text-fg-muted")}
                    >
                      {n}
                    </span>
                  ))}
                </span>
              </div>
              <div className="ml-auto hidden gap-6 md:flex">
                <Stat label="Dials" value="212" />
                <Stat label="Connects" value="31" />
                <Stat label="Booked" value="4" />
              </div>
            </div>

            {/* Parallel lines */}
            <ol className="grid border-b border-border bg-surface sm:grid-cols-3">
              {lines.map((l) => (
                <li key={l.n} className={cn("flex items-center gap-2.5 border-border px-4 py-2.5 max-sm:border-b sm:border-r sm:last:border-r-0", l.tone === "connected" && "bg-brand-soft")}>
                  <span className="font-mono text-[11px] text-fg-muted">L{l.n}</span>
                  <span className="min-w-0">
                    <span className={cn("block truncate text-[12.5px] font-medium", l.tone === "connected" ? "text-fg" : "font-mono text-fg-secondary")}>{l.who}</span>
                    <span className={cn("block truncate text-[11px]", l.tone === "connected" ? "text-brand-text" : "text-fg-muted")}>{l.detail}</span>
                  </span>
                  {l.tone === "connected" && <StatusDot tone="connected" live className="ml-auto" />}
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-1 bg-background md:grid-cols-[1fr_300px]">
              {/* Lead */}
              <div className="flex min-w-0 flex-col gap-4 p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <Avatar name="Rachel Donovan" initials="RD" size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[18px] font-bold tracking-[-0.02em] text-fg">Rachel Donovan</span>
                      <LeadStateBadge state="fresh" size="sm" explain={false} />
                    </div>
                    <p className="mt-0.5 text-[12px] text-fg-muted">
                      <span className="font-mono text-fg-secondary">(303) 555-0101</span> · Denver, CO · web form, 4 min ago
                    </p>
                  </div>
                </div>

                <p className="text-[12.5px] leading-5 text-fg-secondary">
                  <span className="font-medium text-fg">First in queue because</span> she filled the form 4 minutes ago, has 0 attempts, and the speed-to-lead window is 5 minutes.
                </p>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-y border-border py-3 text-[12px] sm:grid-cols-4">
                  {[
                    ["Monthly bill", "$220"],
                    ["Homeowner", "Yes"],
                    ["Utility", "Xcel Energy"],
                    ["Attempts", "0 of 6"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-fg-muted">{k}</dt>
                      <dd className="font-medium text-fg">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <div className="mb-2 flex items-center gap-4 text-[12px]">
                    <span className="font-medium text-fg">Transcript</span>
                    <span className="text-fg-muted">Script</span>
                    <span className="text-fg-muted">Notes</span>
                  </div>
                  <ol className="flex flex-col gap-2">
                    {transcript.map((line, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.45, duration: 0.25 }}
                        className="grid grid-cols-[52px_1fr] gap-2 text-[12px] leading-5"
                      >
                        <span className={cn("font-semibold", line.agent ? "text-brand-text" : "text-fg")}>{line.who}</span>
                        {i === transcript.length - 1 ? (
                          // Newest line types in once, like a live transcript; earlier lines are already settled.
                          <TypedLine text={line.text} delayMs={(0.5 + i * 0.45) * 1000 + 250} className="text-fg-secondary" />
                        ) : (
                          <span className="text-fg-secondary">{line.text}</span>
                        )}
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Call panel */}
              <div className="flex flex-col border-t border-border bg-surface md:border-t-0 md:border-l">
                <div className="flex items-end justify-between gap-2 px-4 pt-4 pb-3">
                  <div>
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-success-text">
                      <StatusDot tone="connected" live /> Connected
                    </span>
                    <span className="mt-1 block font-mono text-[26px] leading-none font-semibold text-fg tabular">{formatClock(callSec)}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] text-fg-muted">
                    <AudioLevel /> rec
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 px-4 pb-4">
                  {(
                    [
                      [Mic, "Mute"],
                      [Grid3x3, "Keypad"],
                    ] as const
                  ).map(([Icon, label]) => (
                    <span key={label} className="flex flex-col items-center gap-1 rounded-[7px] border border-border-strong bg-surface py-2 text-[10.5px] text-fg-secondary">
                      <Icon className="size-4" />
                      {label}
                    </span>
                  ))}
                  <span className="flex flex-col items-center gap-1 rounded-[7px] bg-danger-solid py-2 text-[10.5px] font-medium text-white">
                    <PhoneOff className="size-4" />
                    End
                  </span>
                </div>
                <div className="border-t border-border px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-[11.5px]">
                    <span className="font-medium text-fg">Outcome</span>
                    <span className="font-mono text-fg-muted">keys 1–9</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {dispositions.map((code) => {
                      const m = DISPOSITION_META[code];
                      const selected = code === "appointment";
                      return (
                        <span
                          key={code}
                          className={cn(
                            "flex items-center justify-between gap-1 rounded-[6px] border px-2 py-1.5 text-[11px] leading-tight",
                            code === "dnc" && "col-span-2",
                            selected ? "border-brand bg-brand-soft font-medium text-fg" : "border-border text-fg-secondary",
                          )}
                        >
                          <span className="truncate">{m.label}</span>
                          <span className="font-mono text-[9.5px] text-fg-muted">{m.shortcut}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-[11px]">
                  <span className="text-success-text">Synced to GoHighLevel</span>
                  <span className="text-fg-muted">Next: Victor A.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </figure>
    </motion.div>
  );
}
