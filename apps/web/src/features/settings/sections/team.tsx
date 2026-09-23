"use client";

import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { PERMISSIONS, ROLES, type Permission } from "@dialbrio/types";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "../kit";

const ROWS: { permission: Permission; label: string }[] = [
  { permission: "dialer.use", label: "Use the dialer" },
  { permission: "queue.manage", label: "Manage queues" },
  { permission: "campaigns.manage", label: "Create and edit campaigns" },
  { permission: "analytics.team", label: "Team analytics" },
  { permission: "workflows.manage", label: "Follow-up workflows" },
  { permission: "numbers.manage", label: "Manage phone numbers" },
  { permission: "compliance.manage", label: "Change compliance rules" },
  { permission: "integrations.manage", label: "Manage integrations" },
  { permission: "billing.manage", label: "Billing" },
];
const roleLabel = { admin: "Admin", manager: "Manager", agent: "Agent" };

export function TeamSettings() {
  return (
    <SettingsCard
      title="Roles"
      description="Roles are fixed in this release. Permissions are enforced by the API; navigation hides what a role cannot use."
      actions={
        <Button asChild size="sm">
          <Link href="/app/team">
            Manage team <ArrowRight />
          </Link>
        </Button>
      }
    >
      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-0 text-[13px]">
          <caption className="sr-only">Permissions by role</caption>
          <thead>
            <tr>
              <th scope="col" className="border-b border-border px-5 pb-2 text-left text-xs font-medium text-fg-muted">
                Capability
              </th>
              {ROLES.map((r) => (
                <th key={r} scope="col" className="w-24 border-b border-border px-2 pb-2 text-center text-xs font-medium text-fg-muted last:pr-5">
                  {roleLabel[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.permission}>
                <th scope="row" className="border-b border-border px-5 py-2.5 text-left font-normal text-fg">
                  {row.label}
                </th>
                {ROLES.map((r) => {
                  const ok = (PERMISSIONS[row.permission] as readonly string[]).includes(r);
                  return (
                    <td key={r} className="border-b border-border px-2 py-2.5 text-center last:pr-5">
                      {ok ? <Check className="mx-auto size-4 text-success-text" aria-label="Allowed" /> : <Minus className="mx-auto size-4 text-fg-muted" aria-label="Not allowed" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsCard>
  );
}
