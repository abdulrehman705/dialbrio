import type { Metadata } from "next";
import { PlannedModule } from "@/components/app/planned-module";
import { Guard } from "@/components/app/guard";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <Guard permission="calendar.view" area="Calendar">
      <PlannedModule
        title="Calendar"
        description="Appointments your reps booked, with the call and campaign that produced them."
        phase="Phase 4"
        intro="Your GoHighLevel calendars stay the source of truth. DialBrio won't become a second calendar; this screen will show what calling booked, who booked it, and which appointments need a reminder or a rescue call."
        capabilities={[
          { title: "Book mid-call", detail: "Reps pick a slot from live CRM availability without leaving the dialer. Round-robin routing and buffers come from the calendar itself.", spec: "round-robin + buffers" },
          { title: "Reminders that cut no-shows", detail: "Each booking starts an SMS reminder sequence. A no-show goes back into the Warm queue with the reason attached." },
          { title: "Attribution", detail: "Every appointment traces back to the call, campaign and list that produced it, per rep and per client.", spec: "call → deal reporting" },
          { title: "Today and this week", detail: "Upcoming appointments by rep and by client, with status: confirmed, pending, no-show, completed." },
        ]}
        related={[
          { label: "Book from a call in the Dialer", href: "/app/dialer" },
          { label: "Appointment rate in Analytics", href: "/app/analytics" },
        ]}
      />
    </Guard>
  );
}
