import type { Metadata } from "next";
import { Suspense } from "react";
import { Guard } from "@/components/app/guard";
import { QueueManager } from "@/features/queue/queue-manager";

export const metadata: Metadata = { title: "Queue" };

export default function QueuePage() {
  return (
    <Guard permission="queue.manage" area="the Queue manager">
      <Suspense>
        <QueueManager />
      </Suspense>
    </Guard>
  );
}
