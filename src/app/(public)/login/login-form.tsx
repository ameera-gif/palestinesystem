"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Field label="Email address" required>
        <Input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
      </Field>
      <Field label="Password" required>
        <Input type="password" name="password" required autoComplete="current-password" placeholder="••••••••" />
      </Field>
      {state?.error && (
        <p className="text-sm text-danger bg-danger-light rounded-lg px-3 py-2">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign In →"}
      </Button>
    </form>
  );
}
