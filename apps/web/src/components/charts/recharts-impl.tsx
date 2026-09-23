"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/lib/utils";
import { ChartTooltip } from "./chart-tooltip";
import type { BaseChartProps } from "./types";
import { colorVar } from "./types";

const axisTick = { fill: "var(--fg-muted)", fontSize: 11, fontFamily: "var(--font-mono)" };
const cursorFill = { fill: "var(--surface-hover)" };

export interface TrendChartProps<T> extends BaseChartProps<T> {
  labelFormat?: (l: string) => string;
  tickFormat?: (l: string) => string;
}

/** Time series: 1.5px lines; the first series gets a flat 8% fill (no gradients). */
export function TrendChartImpl<T extends object>({ data, xKey, series, height = 240, valueFormat, axisFormat = formatCompact, labelFormat, tickFormat }: TrendChartProps<T>) {
  const first = series[0]?.key;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 20, bottom: 0, left: -8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
        <XAxis dataKey={xKey as string} tick={axisTick} tickLine={false} axisLine={false} tickFormatter={tickFormat} minTickGap={16} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={axisFormat} width={48} />
        <Tooltip
          cursor={{ stroke: "var(--border-strong)" }}
          content={(p) => <ChartTooltip active={p.active} label={p.label} payload={p.payload} series={series} valueFormat={valueFormat} labelFormat={labelFormat} />}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="linear"
            dataKey={s.key}
            stroke={colorVar(s.color)}
            strokeWidth={1.5}
            fill={s.key === first ? colorVar(s.color) : "transparent"}
            fillOpacity={s.key === first ? 0.08 : 0}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--surface)" }}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export interface BarsChartProps<T> extends BaseChartProps<T> {
  /** "horizontal" = categories on the y-axis (long labels, rankings). */
  layout?: "vertical" | "horizontal";
  labelFormat?: (l: string) => string;
  tickFormat?: (l: string) => string;
  categoryWidth?: number;
  /** Mute individual bars (e.g. future hours) by index. */
  mutedIndex?: (i: number) => boolean;
}

/** Thin bars with slightly rounded data-ends and a gap between groups. */
export function BarsChartImpl<T extends object>({
  data,
  xKey,
  series,
  height = 240,
  valueFormat,
  axisFormat = formatCompact,
  layout = "vertical",
  labelFormat,
  tickFormat,
  categoryWidth = 112,
  mutedIndex,
}: BarsChartProps<T>) {
  const horizontal = layout === "horizontal";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 16, bottom: 0, left: horizontal ? 0 : -8 }} barGap={2} barCategoryGap={horizontal ? "28%" : "22%"}>
        <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke="var(--border)" strokeDasharray="2 4" />
        {horizontal ? (
          <>
            <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={axisFormat} />
            <YAxis type="category" dataKey={xKey as string} tick={axisTick} tickLine={false} axisLine={false} width={categoryWidth} tickFormatter={tickFormat} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey as string} tick={axisTick} tickLine={false} axisLine={false} tickFormatter={tickFormat} minTickGap={8} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={axisFormat} width={48} />
          </>
        )}
        <Tooltip
          cursor={cursorFill}
          content={(p) => <ChartTooltip active={p.active} label={p.label} payload={p.payload} series={series} valueFormat={valueFormat} labelFormat={labelFormat} />}
        />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={colorVar(s.color)} radius={horizontal ? [0, 2, 2, 0] : [2, 2, 0, 0]} maxBarSize={horizontal ? 14 : 18} isAnimationActive={false}>
            {mutedIndex && data.map((_, i) => <Cell key={i} fillOpacity={mutedIndex(i) ? 0.25 : 1} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
