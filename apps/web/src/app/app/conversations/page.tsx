import type { Metadata } from "next";
import { Suspense } from "react";
import { Guard } from "@/components/app/guard";
import { ConversationsView } from "@/features/conversations/conversations-view";

export const metadata: Metadata = { title: "Conversations" };

export default function ConversationsPage() {
  return (
    <Guard permission="conversations.view" area="Conversations">
      <Suspense>
        <ConversationsView />
      </Suspense>
    </Guard>
  );
}
