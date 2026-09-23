"use client";

import { AnimatePresence, motion } from "motion/react";
import type { TranscriptSegment } from "@dialbrio/types";
import { cn, formatClock } from "@/lib/utils";

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  agentName?: string;
  contactName?: string;
  live?: boolean;
  className?: string;
}

/** Speaker-labelled transcript. Live mode fades new lines in and is announced politely. */
export function TranscriptViewer({ segments, agentName = "Agent", contactName = "Contact", live, className }: TranscriptViewerProps) {
  return (
    <ol className={cn("flex flex-col gap-3", className)} aria-live={live ? "polite" : undefined} aria-label="Transcript">
      <AnimatePresence initial={false}>
        {segments.map((s) => (
          <motion.li
            key={s.id}
            initial={live ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-[44px_1fr] gap-3"
          >
            <span className="pt-0.5 font-mono text-[11px] text-fg-muted tabular">{formatClock(s.atSec)}</span>
            <div>
              <span className={cn("text-xs font-semibold", s.speaker === "agent" ? "text-brand-text" : s.speaker === "ai" ? "text-ai-text" : "text-fg")}>
                {s.speaker === "agent" ? agentName : s.speaker === "ai" ? "AI agent" : contactName}
              </span>
              <p className="text-[13px] leading-relaxed text-fg-secondary">{s.text}</p>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
