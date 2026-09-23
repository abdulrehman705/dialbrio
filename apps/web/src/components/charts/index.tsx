"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { BarsChartProps, TrendChartProps } from "./recharts-impl";

export { ChartFigure, ChartLegend } from "./chart-figure";
export type { ChartSeries, ChartColor, ValueFormatter } from "./types";

const loading = () => <Skeleton className="h-60 w-full" />;

/** Recharts is loaded on demand so it never blocks the shell (docs/architecture.md §14). */
export const TrendChart = dynamic(() => import("./recharts-impl").then((m) => m.TrendChartImpl), { ssr: false, loading }) as <T extends object>(p: TrendChartProps<T>) => React.ReactElement;
export const BarsChart = dynamic(() => import("./recharts-impl").then((m) => m.BarsChartImpl), { ssr: false, loading }) as <T extends object>(p: BarsChartProps<T>) => React.ReactElement;
