"use client";

import { useFormContext } from "react-hook-form";
import { Bot, Pencil, TriangleAlert } from "lucide-react";
import { DISPOSITION_META, LEAD_STATE_META } from "@/components/domain";
import { Button } from "@/components/ui/button";
import { useAgentActivity } from "@/lib/queries";
import { formatPhone } from "@/lib/utils";
import { formatMinutes, formatWindow } from "@/features/queue/utils";
import { DIAL_MODE_LABEL, LEAD_SOURCE_TYPES, ROTATIONS, type CampaignFormValues } from "../schema";
import { StrategyBadge } from "../shared";
import { StepHeader } from "./controls";
import { STEPS } from "./steps";

function Block({ step, onEdit, children }: { step: number; onEdit: (i: number) => void; children: React.ReactNode }) {
  const s = STEPS[step]!;
  return (
    <section className="rounded-lg border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <h3 className="flex items-baseline gap-2 text-[13px] font-semibold text-fg">
          <span className="font-mono text-[11px] font-normal text-fg-muted">{String(step + 1).padStart(2, "0")}</span> {s.title}
        </h3>
        <Button type="button" size="xs" variant="ghost" onClick={() => onEdit(step)} aria-label={`Edit ${s.title}`}>
          <Pencil /> Edit
        </Button>
      </div>
      <dl className="divide-y divide-border text-[13px]">{children}</dl>
    </section>
  );
}

function Item({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-fg-muted">{k}</dt>
      <dd className="min-w-0 text-fg">{children}</dd>
    </div>
  );
}

export function StepReview({ onEdit }: { onEdit: (i: number) => void }) {
  const { watch } = useFormContext<CampaignFormValues>();
  const v = watch();
  const agents = useAgentActivity();
  const agentNames = v.agentIds.map((id) => agents.data?.find((a) => a.userId === id)?.name ?? id);

  return (
    <>
      <StepHeader title="Review & launch" description="Check the configuration. Launching makes matching leads eligible for dialing immediately." />
      {v.dialStrategy === "ai" && (
        <div role="status" className="mb-4 flex gap-2.5 rounded-lg border border-border bg-ai-soft p-3 text-[13px] text-ai-text">
          <Bot className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>AI voice campaigns can be saved as drafts now. Launching becomes available with AI voice in Phase 6, and nothing you set here will need to change.</p>
        </div>
      )}
      <div className="space-y-4">
        <Block step={0} onEdit={onEdit}>
          <Item k="Name">{v.name || <span className="text-danger-text">Missing</span>}</Item>
          {v.description && <Item k="Description">{v.description}</Item>}
          <Item k="Strategy">
            <StrategyBadge strategy={v.dialStrategy} size="sm" />
          </Item>
          <Item k="Dial mode">
            {DIAL_MODE_LABEL[v.dialMode]}
            {v.dialMode === "parallel" && <span className="text-fg-muted"> · {v.lines} lines per rep · consent {v.parallelAck ? "confirmed" : <span className="text-danger-text">not confirmed</span>}</span>}
          </Item>
        </Block>
        <Block step={1} onEdit={onEdit}>
          <Item k="Source">
            {LEAD_SOURCE_TYPES.find((t) => t.value === v.leadSource.type)?.label}: {v.leadSource.value || <span className="text-danger-text">Not selected</span>}
          </Item>
          <Item k="Speed to lead">{v.speedToLead ? "On. New leads are dialed within about 10 seconds." : "Off"}</Item>
        </Block>
        <Block step={2} onEdit={onEdit}>
          <Item k="Lifecycle states">
            {v.leadStates.map((s) => LEAD_STATE_META[s].label).join(", ")}
          </Item>
          <Item k="Priority">{v.queuePriority}</Item>
        </Block>
        <Block step={3} onEdit={onEdit}>
          <Item k="Calling window">{formatWindow(v.callingWindow)}</Item>
          <Item k="Max attempts">{v.maxAttempts}</Item>
          <Item k="Retries">
            {v.retryRules.length
              ? v.retryRules.map((r) => `${DISPOSITION_META[r.disposition].label}: wait ${formatMinutes(r.delayMinutes)}, up to ${r.maxAttempts}×`).join(" · ")
              : "None"}
          </Item>
        </Block>
        <Block step={4} onEdit={onEdit}>
          <Item k={`Enabled (${v.dispositions.length})`}>{v.dispositions.map((d) => DISPOSITION_META[d].label).join(", ")}</Item>
        </Block>
        <Block step={5} onEdit={onEdit}>
          <Item k="Voicemail drop">{v.followUp.voicemailDrop ? "Allowed" : "Off"}</Item>
          <Item k="SMS after no answer">{v.followUp.onNoAnswerSms ? `On: “${v.followUp.smsTemplate}”` : "Off"}</Item>
          <Item k="Callback reminder">{v.followUp.callbackReminderMinutes ? `${v.followUp.callbackReminderMinutes} min before` : "None"}</Item>
        </Block>
        <Block step={6} onEdit={onEdit}>
          <Item k="Caller IDs">
            {v.callerIds.length ? <span className="font-mono text-xs">{v.callerIds.map(formatPhone).join(", ")}</span> : <span className="text-danger-text">None selected</span>}
          </Item>
          <Item k="Rotation">{ROTATIONS.find((r) => r.value === v.numberRotation)?.label}</Item>
        </Block>
        <Block step={7} onEdit={onEdit}>
          <Item k={`Agents (${v.agentIds.length})`}>
            {agentNames.length ? agentNames.join(", ") : v.dialStrategy === "ai" ? "None (optional for AI)" : <span className="inline-flex items-center gap-1 text-danger-text"><TriangleAlert className="size-3.5" aria-hidden /> None assigned</span>}
          </Item>
        </Block>
      </div>
    </>
  );
}
