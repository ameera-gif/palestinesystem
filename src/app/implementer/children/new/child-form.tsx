"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createChildAction, type ChildFormState } from "./actions";

const REGIONS = ["Gaza City", "Khan Younis", "Rafah", "Deir al-Balah", "Jabalia", "Beit Lahia", "Nuseirat"];

export function ChildForm({
  ufukStaff,
  selfAssign,
}: {
  ufukStaff: { id: string; name: string }[];
  /** Set when the current user is Ufuk staff — locks assignment to them. */
  selfAssign: { id: string; name: string } | null;
}) {
  const [state, formAction, isPending] = useActionState<ChildFormState, FormData>(createChildAction, null);

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Identity</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Display name (shown to sponsors)" required>
            <Input name="displayName" required />
          </Field>
          <Field label="Full legal name" required hint="Restricted — never shown to sponsors or the public">
            <Input name="fullName" required />
          </Field>
          <Field label="Date of birth" required>
            <Input type="date" name="dateOfBirth" required />
          </Field>
          <Field label="Gender" required>
            <Select name="gender" required>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </Select>
          </Field>
          <Field label="Region" required hint="Coarse location only — never an exact address">
            <Select name="region" required>
              <option value="">Select a region</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          {selfAssign ? (
            <Field label="Assigned Ufuk staff" hint="You're registering this child, so it's assigned to you.">
              <input type="hidden" name="assignedUfukStaffId" value={selfAssign.id} />
              <div className="flex items-center h-9.5 px-3 rounded-lg border border-border bg-brand-light text-sm text-ink">
                {selfAssign.name} <span className="text-muted ml-1">(you)</span>
              </div>
            </Field>
          ) : (
            <Field label="Assigned Ufuk staff" hint="You're registering on Ufuk's behalf — choose who's responsible.">
              <Select name="assignedUfukStaffId">
                <option value="">Unassigned</option>
                {ufukStaff.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Approved Profile Content</h2>
        <Field label="Short biography" hint="Dignity-first, approved for sponsor/public view once profile is published">
          <Textarea name="bio" maxLength={500} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Interests">
            <Input name="interests" placeholder="e.g. drawing, football" />
          </Field>
          <Field label="Aspirations">
            <Input name="aspirations" placeholder="e.g. become a doctor" />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Education</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Education stage" hint="Approved for sponsor view">
            <Input name="educationStage" placeholder="e.g. Grade 5 – Primary" />
          </Field>
          <Field label="School name" hint="Internal only">
            <Input name="schoolName" />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">
          Guardian / Household <span className="text-danger font-normal normal-case">— restricted, never shown to sponsors</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Guardian name" required>
            <Input name="guardianName" required />
          </Field>
          <Field label="Relationship to child" required>
            <Input name="guardianRelationship" required placeholder="e.g. Mother" />
          </Field>
          <Field label="Guardian phone">
            <Input name="guardianPhone" />
          </Field>
          <Field label="Address">
            <Input name="guardianAddress" />
          </Field>
        </div>
        <Field label="Household notes">
          <Textarea name="householdNotes" maxLength={800} />
        </Field>
      </section>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-light rounded-lg px-3 py-2">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Register Child"}
      </Button>
    </form>
  );
}
