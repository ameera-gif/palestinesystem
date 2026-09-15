"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { signupAction, type SignupState } from "./actions";

export function SignupForm({ childId }: { childId?: string }) {
  const [state, formAction, isPending] = useActionState<SignupState, FormData>(signupAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="childId" value={childId ?? ""} />
      <Field label="Full name" required>
        <Input name="name" required autoComplete="name" />
      </Field>
      <Field label="Email address" required>
        <Input type="email" name="email" required autoComplete="email" />
      </Field>
      <Field label="Country" hint="Optional">
        <Input name="country" autoComplete="country-name" />
      </Field>
      <Field label="Password" required hint="At least 8 characters">
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </Field>
      {state?.error && (
        <p className="text-sm text-danger bg-danger-light rounded-lg px-3 py-2">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Create Sponsor Account"}
      </Button>
    </form>
  );
}
