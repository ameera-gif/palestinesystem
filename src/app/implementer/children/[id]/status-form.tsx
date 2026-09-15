"use client";

import { useActionState } from "react";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { changeStatusAction } from "./actions";

const NEXT_STATUS_OPTIONS: Record<string, string[]> = {
  DRAFT: ["ELIGIBLE"],
  ELIGIBLE: ["AVAILABLE", "ON_HOLD"],
  AVAILABLE: ["ON_HOLD", "EXITED"],
  SPONSORED: ["ON_HOLD", "EXITED"],
  ON_HOLD: ["AVAILABLE", "ELIGIBLE", "EXITED"],
  EXITED: [],
};

export function StatusChangeForm({ childId, currentStatus }: { childId: string; currentStatus: string }) {
  const action = changeStatusAction.bind(null, childId);
  const [state, formAction, isPending] = useActionState(action, null);
  const options = NEXT_STATUS_OPTIONS[currentStatus] ?? [];

  if (options.length === 0) return <p className="text-sm text-muted">No further status changes available.</p>;

  return (
    <form action={formAction} className="space-y-3">
      <Field label="Change status to">
        <Select name="toStatus" required>
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o.replace("_", " ")}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Reason" required hint="Required for the audit trail">
        <Textarea name="reason" required maxLength={400} />
      </Field>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Updating…" : "Update Status"}
      </Button>
    </form>
  );
}
