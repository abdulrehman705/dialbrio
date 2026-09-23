import { cn } from "@/lib/utils";

const palette = ["bg-brand-soft text-brand-text", "bg-lead-fresh-soft text-lead-fresh-text", "bg-ai-soft text-ai-text", "bg-success-soft text-success-text", "bg-warning-soft text-warning-text"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface AvatarProps {
  name: string;
  initials: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  status?: React.ReactNode;
}

const sizes = { xs: "size-5 text-[9px]", sm: "size-7 text-[11px]", md: "size-8 text-xs", lg: "size-10 text-sm", xl: "size-14 text-lg" };

export function Avatar({ name, initials, size = "md", className, status }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        role="img"
        aria-label={name}
        className={cn("inline-flex items-center justify-center rounded-full font-semibold", sizes[size], palette[hash(name) % palette.length])}
      >
        {initials}
      </span>
      {status && <span className="absolute -right-0.5 -bottom-0.5 rounded-full ring-2 ring-surface">{status}</span>}
    </span>
  );
}
