import type { Metadata } from "next";
import { Suspense } from "react";
import { Guard } from "@/components/app/guard";
import { ContactsView } from "@/features/contacts/contacts-view";

export const metadata: Metadata = { title: "Contacts" };

export default function ContactsPage() {
  return (
    <Guard permission="contacts.view" area="Contacts">
      <Suspense>
        <ContactsView />
      </Suspense>
    </Guard>
  );
}
