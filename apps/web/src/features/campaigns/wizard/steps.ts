import { Bell, CalendarClock, CircleCheck, Hash, ListChecks, ListOrdered, Settings2, Target, Users, type LucideIcon } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import type { CampaignFormValues } from "../schema";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Fields validated before leaving the step. */
  fields: FieldPath<CampaignFormValues>[];
}

export const STEPS: WizardStep[] = [
  { id: "basics", title: "Basics", description: "Name, dial strategy and mode", icon: Settings2, fields: ["name", "description", "dialStrategy", "dialMode", "lines", "parallelAck"] },
  { id: "source", title: "Lead source", description: "Where leads come from", icon: Target, fields: ["leadSource.type", "leadSource.value", "speedToLead"] },
  { id: "queue", title: "Queue & priority", description: "Lifecycle states and priority", icon: ListOrdered, fields: ["leadStates", "queuePriority"] },
  { id: "rules", title: "Calling rules", description: "Window, attempts and retries", icon: CalendarClock, fields: ["callingWindow", "callingWindow.days", "callingWindow.start", "callingWindow.end", "maxAttempts", "retryRules"] },
  { id: "dispositions", title: "Dispositions", description: "Outcomes agents can choose", icon: ListChecks, fields: ["dispositions"] },
  { id: "followup", title: "Follow-up", description: "Voicemail drop, SMS, reminders", icon: Bell, fields: ["followUp", "followUp.smsTemplate", "followUp.callbackReminderMinutes"] },
  { id: "numbers", title: "Numbers", description: "Caller IDs and rotation", icon: Hash, fields: ["callerIds", "numberRotation"] },
  { id: "agents", title: "Agents", description: "Who works this campaign", icon: Users, fields: ["agentIds"] },
  { id: "review", title: "Review & launch", description: "Check everything once", icon: CircleCheck, fields: [] },
];
