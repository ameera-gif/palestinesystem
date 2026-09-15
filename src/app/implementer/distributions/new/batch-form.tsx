"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createBatchAction, type BatchFormState } from "./actions";

export function BatchForm({ children }: { children: { id: string; displayName: string; childCode: string }[] }) {
  const [state, formAction, isPending] = useActionState<BatchFormState, FormData>(createBatchAction, null);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Batch label" required hint='e.g. "Q1 2027"'>
          <Input name="label" required />
        </Field>
        <Field label="Period start" required>
          <Input type="date" name="periodStart" required />
        </Field>
        <Field label="Period end" required>
          <Input type="date" name="periodEnd" required />
        </Field>
      </div>

      <div>
        <p className="text-sm font-medium text-ink mb-2">Select children for this batch</p>
        <div className="rounded-lg border border-border max-h-80 overflow-y-auto divide-y divide-border">
          {children.map((c) => (
            <label key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-light/30 cursor-pointer">
              <input type="checkbox" name="childIds" value={c.id} className="h-4 w-4" />
              <span className="text-ink">{c.displayName}</span>
              <span className="text-muted">({c.childCode})</span>
            </label>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create Batch"}
      </Button>
    </form>
  );
}
