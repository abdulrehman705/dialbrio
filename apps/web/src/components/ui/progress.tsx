import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0..100
  tone?: "brand" | "success" | "warning" | "danger" | "ai";
  className?: string;
  label: string;
}

const tones = { brand: "bg-brand", success: "bg-success", warning: "bg-warning", danger: "bg-danger", ai: "bg-ai" };

export function Progress({ value, tone = "brand", className, label }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-active", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-(--duration-slower) ease-out", tones[tone])} style={{ width: `${v}%` }} />
    </div>
  );
}
