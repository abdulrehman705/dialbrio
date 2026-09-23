import type { Metadata } from "next";
import { Guard } from "@/components/app/guard";
import { DialerWorkspace } from "@/features/dialer/dialer-workspace";

export const metadata: Metadata = { title: "Dialer" };

export default function DialerPage() {
  return (
    <Guard permission="dialer.use" area="the Dialer">
      <DialerWorkspace />
    </Guard>
  );
}
