import type { ID, ISODateString } from "@dialbrio/types";

/**
 * CRM boundary. Core business logic depends on this interface only — never on a vendor SDK.
 * Implementations: GHLAdapter (Phase 1). Future: HubSpotAdapter, ZohoAdapter, SalesforceAdapter.
 */
export interface CRMContact {
  externalId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  source?: string;
  tags: string[];
  customFields: Record<string, string>;
  /** Provider's last-modified timestamp; used as the stale-event guard. */
  updatedAt: ISODateString;
}

export interface CRMCalendar { externalId: string; name: string; timezone: string }
export interface CRMSlot { startsAt: ISODateString; endsAt: ISODateString }

export interface CRMAppointmentInput {
  calendarExternalId: string;
  contactExternalId: string;
  startsAt: ISODateString;
  title: string;
  notes?: string;
  /** Passed through to the provider where supported; always checked locally first. */
  idempotencyKey: string;
}

export interface CRMContext { connectionId: ID; locationId: string }

export interface CRMAdapter {
  readonly provider: "ghl" | "hubspot" | "zoho" | "salesforce";
  getContact(ctx: CRMContext, externalId: string): Promise<CRMContact | null>;
  updateContact(ctx: CRMContext, externalId: string, patch: Partial<Omit<CRMContact, "externalId" | "updatedAt">>): Promise<void>;
  addNote(ctx: CRMContext, externalId: string, body: string): Promise<{ noteId: string }>;
  updateFields(ctx: CRMContext, externalId: string, fields: Record<string, string>): Promise<void>;
  getCalendars(ctx: CRMContext): Promise<CRMCalendar[]>;
  getAvailability(ctx: CRMContext, calendarExternalId: string, from: ISODateString, to: ISODateString): Promise<CRMSlot[]>;
  createAppointment(ctx: CRMContext, input: CRMAppointmentInput): Promise<{ appointmentId: string }>;
  addTag(ctx: CRMContext, externalId: string, tag: string): Promise<void>;
  removeTag(ctx: CRMContext, externalId: string, tag: string): Promise<void>;
}
