import { CalendarDays } from "lucide-react";
import type { Appointment } from "@dialbrio/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusTone = { confirmed: "success", pending: "warning", cancelled: "neutral", no_show: "danger", completed: "neutral" } as const;
const statusLabel = { confirmed: "Confirmed", pending: "Pending", cancelled: "Cancelled", no_show: "No-show", completed: "Completed" };

export function AppointmentCard({ appt, className }: { appt: Appointment; className?: string }) {
  const d = new Date(appt.startsAt);
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border border-border bg-surface p-3", className)}>
      <div className="flex w-11 shrink-0 flex-col items-center rounded-md border border-border bg-surface-sunken py-1">
        <span className="text-[10px] font-semibold uppercase text-fg-muted">{format(d, "MMM")}</span>
        <span className="text-base leading-5 font-semibold text-fg tabular">{format(d, "d")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-medium text-fg">{appt.contactName}</p>
          <Badge tone={statusTone[appt.status]} size="sm">
            {statusLabel[appt.status]}
          </Badge>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted">
          <CalendarDays className="size-3" aria-hidden />
          <span className="font-mono tabular">{format(d, "h:mm a")}</span> · {appt.calendarName}
        </p>
        <p className="mt-0.5 truncate text-xs text-fg-muted">
          Booked by {appt.agentName} · {appt.campaignName}
        </p>
      </div>
    </div>
  );
}
