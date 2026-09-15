"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createStaffUserAction, type CreateUserState } from "./actions";

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState<CreateUserState, FormData>(createStaffUserAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Full name" required>
        <Input name="name" required />
      </Field>
      <Field label="Email" required>
        <Input type="email" name="email" required />
      </Field>
      <Field label="Temporary password" required hint="At least 8 characters">
        <Input type="password" name="password" required minLength={8} />
      </Field>
      <Field label="Role" required>
        <Select name="role" required defaultValue="UFUK">
          <option value="UFUK">Ufuk Field Team</option>
          <option value="MYFUNDACTION_PC">MyFundAction Project Coordinator</option>
          <option value="ADMIN">System Administrator</option>
        </Select>
      </Field>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">User created.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create Staff Account"}
      </Button>
    </form>
  );
}
