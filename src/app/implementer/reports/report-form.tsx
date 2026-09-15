"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-pill";
import { saveReportAction, type ReportFormState } from "./report-actions";
import type { Report } from "@prisma/client";

function dateInputValue(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function ReportForm({
  report,
  childOptions,
  defaultChildId,
}: {
  report?: Report;
  childOptions: { id: string; displayName: string }[];
  defaultChildId?: string;
}) {
  const action = saveReportAction.bind(null, report?.id);
  const [state, formAction, isPending] = useActionState<ReportFormState, FormData>(action, null);
  const editable = !report || report.status === "DRAFT" || report.status === "RETURNED";

  return (
    <form action={formAction} className="space-y-8">
      {report?.status === "RETURNED" && report.currentReviewComment && (
        <div className="rounded-lg bg-danger-light text-danger px-4 py-3 text-sm">
          <p className="font-semibold mb-1">Amendment requested by MyFundAction:</p>
          <p>{report.currentReviewComment}</p>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Report Details</h2>
          {report && <StatusBadge status={report.status} domain="report" />}
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Child" required>
            <Select name="childId" required defaultValue={report?.childId ?? defaultChildId ?? ""} disabled={!editable}>
              <option value="">Select…</option>
              {childOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Period start" required>
            <Input type="date" name="reportingPeriodStart" required defaultValue={dateInputValue(report?.reportingPeriodStart)} disabled={!editable} />
          </Field>
          <Field label="Period end" required>
            <Input type="date" name="reportingPeriodEnd" required defaultValue={dateInputValue(report?.reportingPeriodEnd)} disabled={!editable} />
          </Field>
        </div>
      </section>

      <fieldset disabled={!editable} className="space-y-8 disabled:opacity-70">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Academic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="School year">
              <Input name="schoolYear" defaultValue={report?.schoolYear ?? ""} placeholder="e.g. 2025/2026" />
            </Field>
            <Field label="Attendance summary">
              <Input name="attendanceSummary" defaultValue={report?.attendanceSummary ?? ""} />
            </Field>
          </div>
          <Field label="Overall academic progress">
            <Textarea name="academicProgress" defaultValue={report?.academicProgress ?? ""} />
          </Field>
          <Field label="Subject-level progress">
            <Textarea name="subjectProgress" defaultValue={report?.subjectProgress ?? ""} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Achievements">
              <Textarea name="achievements" defaultValue={report?.achievements ?? ""} />
            </Field>
            <Field label="Areas needing improvement">
              <Textarea name="areasForImprovement" defaultValue={report?.areasForImprovement ?? ""} />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">General Development</h2>
          <Field label="Participation">
            <Textarea name="participationNotes" defaultValue={report?.participationNotes ?? ""} />
          </Field>
          <Field label="Interests update">
            <Textarea name="interestsUpdate" defaultValue={report?.interestsUpdate ?? ""} />
          </Field>
          <Field label="General development notes">
            <Textarea name="generalDevelopmentNotes" defaultValue={report?.generalDevelopmentNotes ?? ""} />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Narrative Update</h2>
          <Field label="Update for sponsor">
            <Textarea name="narrativeUpdate" defaultValue={report?.narrativeUpdate ?? ""} className="min-h-32" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Challenges">
              <Textarea name="challenges" defaultValue={report?.challenges ?? ""} />
            </Field>
            <Field label="Current needs">
              <Textarea name="currentNeeds" defaultValue={report?.currentNeeds ?? ""} />
            </Field>
          </div>
          <Field label="Next steps">
            <Textarea name="nextSteps" defaultValue={report?.nextSteps ?? ""} />
          </Field>
          <Field label="Guardian / teacher remarks">
            <Textarea name="guardianRemarks" defaultValue={report?.guardianRemarks ?? ""} />
          </Field>
        </section>
      </fieldset>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-light rounded-lg px-3 py-2">{state.error}</p>
      )}

      {editable && (
        <div className="flex gap-3">
          <Button type="submit" name="intent" value="draft" variant="outline" disabled={isPending}>
            Save Draft
          </Button>
          <Button type="submit" name="intent" value="submit" disabled={isPending}>
            Submit to MyFundAction
          </Button>
        </div>
      )}
    </form>
  );
}
