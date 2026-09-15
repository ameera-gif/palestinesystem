"use client";

import { useActionState } from "react";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { sendMessageAction } from "./actions";

export function MessageForm({ children }: { children: { id: string; displayName: string }[] }) {
  const [state, formAction, isPending] = useActionState(sendMessageAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="To">
        <Select name="childId" required>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.displayName}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Occasion">
        <Select name="occasion">
          <option value="Encouragement">Encouragement</option>
          <option value="Eid">Eid</option>
          <option value="Ramadan">Ramadan</option>
          <option value="General">General greeting</option>
        </Select>
      </Field>
      <Field label="Message" required hint="MyFundAction reviews every message before it's delivered by Ufuk.">
        <Textarea name="content" required maxLength={800} placeholder="Write a warm, encouraging note…" />
      </Field>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send for Review"}
      </Button>
    </form>
  );
}
