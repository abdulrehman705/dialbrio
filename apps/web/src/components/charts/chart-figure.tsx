import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChartSeries } from "./types";
import { colorVar } from "./types";

/** Legend for ≥2 series: swatch + label in text tokens (identity never colour-alone). */
export function ChartLegend({ series, className }: { series: ChartSeries[]; className?: string }) {
  if (series.length < 2) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-secondary", className)} aria-hidden>
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ background: colorVar(s.color) }} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Wraps a chart with a screen-reader summary. The visual chart is aria-hidden; the summary
 * (and optional data table) carries the information for assistive tech.
 */
export function ChartFigure({ summary, children, className, legend }: { summary: string; children: React.ReactNode; className?: string; legend?: ChartSeries[] }) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      {legend && <ChartLegend series={legend} />}
      <div aria-hidden className="min-w-0">
        {children}
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
