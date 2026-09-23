/**
 * Chart series colours come from design tokens only (docs/design.md §19). Max 4 series per chart.
 * chart-1 green (the outcome that matters) · chart-2 ink · chart-3 violet (AI series only) ·
 * chart-4 amber · chart-5 muted blue · chart-6 stone (volume / context).
 */
export type ChartColor = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6";

export interface ChartSeries {
  key: string;
  label: string;
  color: ChartColor;
}

export type ValueFormatter = (v: number) => string;

export interface BaseChartProps<T> {
  data: T[];
  xKey: keyof T & string;
  series: ChartSeries[];
  height?: number;
  /** Formats tooltip values (exact, mono). */
  valueFormat?: ValueFormatter;
  /** Formats y-axis ticks (compact). */
  axisFormat?: ValueFormatter;
}

export const colorVar = (c: ChartColor) => `var(--${c})`;
