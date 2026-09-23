"use client";

import type { ChartSeries, ValueFormatter } from "./types";
import { colorVar } from "./types";

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: readonly { dataKey?: unknown; value?: unknown }[];
  series: ChartSeries[];
  valueFormat?: ValueFormatter;
  labelFormat?: (l: string) => string;
}

/** Tooltip on surface-elevated; exact values in mono (docs/design.md §19). */
export function ChartTooltip({ active, label, payload, series, valueFormat = (v) => v.toLocaleString("en-US"), labelFormat }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium text-fg">{labelFormat ? labelFormat(String(label)) : label}</p>
      <ul className="flex flex-col gap-1">
        {series.map((s) => {
          const p = payload.find((x) => x.dataKey === s.key);
          if (!p) return null;
          return (
            <li key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-fg-secondary">
                <span className="size-2 rounded-[2px]" style={{ background: colorVar(s.color) }} aria-hidden />
                {s.label}
              </span>
              <span className="font-mono text-fg tabular">{valueFormat(Number(p.value ?? 0))}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
