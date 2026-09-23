"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "./button";
import { cn, formatClock } from "@/lib/utils";

interface AudioPlayerProps {
  src?: string;
  durationSec: number;
  /** Deterministic waveform seed so bars don't jump between renders. */
  seed?: number;
  className?: string;
  label: string;
}

/** Recording player with a static waveform. Falls back to a disabled state when no recording exists. */
export function AudioPlayer({ src, durationSec, seed = 7, className, label }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0);
  const bars = React.useMemo(() => {
    let s = seed;
    return Array.from({ length: 64 }, () => {
      s = (s * 9301 + 49297) % 233280;
      return 0.25 + (s / 233280) * 0.75;
    });
  }, [seed]);
  const progress = durationSec ? t / durationSec : 0;

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-surface-sunken p-2 pr-3", className)}>
      {src && <audio ref={audioRef} src={src} preload="none" onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />}
      <Button
        size="icon-sm"
        variant="primary"
        disabled={!src}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        onClick={() => {
          const a = audioRef.current;
          if (!a) return;
          if (playing) a.pause();
          else void a.play();
          setPlaying(!playing);
        }}
      >
        {playing ? <Pause /> : <Play />}
      </Button>
      <div className="flex h-8 flex-1 items-center gap-[2px]" aria-hidden>
        {bars.map((h, i) => (
          <span key={i} className={cn("w-full rounded-full", i / bars.length <= progress ? "bg-brand" : "bg-border-strong")} style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <span className="font-mono text-xs text-fg-muted tabular">
        {formatClock(t)} / {formatClock(durationSec)}
      </span>
      {!src && <span className="sr-only">Recording not available</span>}
    </div>
  );
}
