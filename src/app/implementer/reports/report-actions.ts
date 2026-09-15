"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { saveReportDraft, submitReport, ReportError, type ReportFormInput } from "@/lib/services/reports";

export type ReportFormState = { error?: string } | null;

function readForm(formData: FormData): ReportFormInput {
  const get = (key: string) => String(formData.get(key) ?? "") || undefined;
  return {
    childId: String(formData.get("childId") ?? ""),
    reportingPeriodStart: String(formData.get("reportingPeriodStart") ?? ""),
    reportingPeriodEnd: String(formData.get("reportingPeriodEnd") ?? ""),
    schoolYear: get("schoolYear"),
    attendanceSummary: get("attendanceSummary"),
    academicProgress: get("academicProgress"),
    subjectProgress: get("subjectProgress"),
    achievements: get("achievements"),
    areasForImprovement: get("areasForImprovement"),
    participationNotes: get("participationNotes"),
    interestsUpdate: get("interestsUpdate"),
    generalDevelopmentNotes: get("generalDevelopmentNotes"),
    narrativeUpdate: get("narrativeUpdate"),
    challenges: get("challenges"),
    currentNeeds: get("currentNeeds"),
    nextSteps: get("nextSteps"),
    guardianRemarks: get("guardianRemarks"),
  };
}

/**
 * Single action for the report form, bound to a specific reportId (or
 * undefined for a new report) — the "Save Draft" and "Submit" buttons in the
 * form both post here and are told apart by their `intent` value, so both
 * can share one useActionState instance instead of juggling two.
 */
export async function saveReportAction(
  reportId: string | undefined,
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const session = await requireRole("UFUK");
  if (!session.user.profileId) return { error: "Field staff profile not found." };

  const intent = String(formData.get("intent") ?? "draft");
  const input = readForm(formData);
  if (!input.childId || !input.reportingPeriodStart || !input.reportingPeriodEnd) {
    return { error: "Please select a child and reporting period." };
  }

  try {
    const report = await saveReportDraft(session.user.profileId, input, reportId);
    if (intent === "submit") {
      await submitReport(report.id, session.user.profileId, session.user.id);
    }
    revalidatePath("/implementer/reports");
    redirect(`/implementer/reports/${report.id}`);
  } catch (error) {
    if (error instanceof ReportError) return { error: error.message };
    throw error;
  }
}
