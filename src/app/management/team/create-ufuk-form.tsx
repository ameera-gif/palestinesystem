"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createUfukStaffAction, type CreateUfukState } from "./actions";

export function CreateUfukForm() {
  const [state, formAction, isPending] = useActionState<CreateUfukState, FormData>(createUfukStaffAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Full name" required>
        <Input name="name" required />
      </Field>
      <Field label="Email" required>
        <Input type="email" name="email" required />
      </Field>
      <Field label="Temporary password" required hint="At least 8 characters. Share with them securely.">
        <Input type="password" name="password" required minLength={8} />
      </Field>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">Account created.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create Field Team Account"}
      </Button>
    </form>
  );
}
