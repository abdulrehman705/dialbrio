import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  detail?: React.ReactNode;
  time: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "ai";
}

const tones = {
  neutral: "bg-surface-sunken text-fg-muted border-border",
  brand: "bg-brand-soft text-brand-text border-transparent",
  success: "bg-success-soft text-success-text border-transparent",
  warning: "bg-warning-soft text-warning-text border-transparent",
  danger: "bg-danger-soft text-danger-text border-transparent",
  ai: "bg-ai-soft text-ai-text border-transparent",
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < items.length - 1 && <span className="absolute top-7 bottom-0 left-[13px] w-px bg-border" aria-hidden />}
          <span className={cn("relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border [&_svg]:size-3.5", tones[item.tone ?? "neutral"])}>{item.icon}</span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-[13px] font-medium text-fg">{item.title}</p>
              <span className="font-mono text-[11px] text-fg-muted tabular">{item.time}</span>
            </div>
            {item.detail && <p className="mt-0.5 text-[13px] text-fg-muted">{item.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
