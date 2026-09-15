"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { createChild, ChildError, type ChildFormInput } from "@/lib/services/children";

export type ChildFormState = { error?: string } | null;

export async function createChildAction(_prev: ChildFormState, formData: FormData): Promise<ChildFormState> {
  const session = await requireRole("UFUK", "MYFUNDACTION_PC", "ADMIN");

  // A Ufuk user always registers a child as themselves — enforced here, not
  // just by hiding the picker in the form, since a client can submit
  // whatever field values it wants regardless of what the UI shows.
  const submittedAssignee = String(formData.get("assignedUfukStaffId") ?? "") || undefined;
  const assignedUfukStaffId = session.user.role === "UFUK" ? session.user.profileId ?? undefined : submittedAssignee;

  const input: ChildFormInput = {
    displayName: String(formData.get("displayName") ?? "").trim(),
    fullName: String(formData.get("fullName") ?? "").trim(),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    gender: (formData.get("gender") as "MALE" | "FEMALE") ?? "MALE",
    region: String(formData.get("region") ?? "").trim(),
    bio: String(formData.get("bio") ?? "") || undefined,
    interests: String(formData.get("interests") ?? "") || undefined,
    aspirations: String(formData.get("aspirations") ?? "") || undefined,
    educationStage: String(formData.get("educationStage") ?? "") || undefined,
    schoolName: String(formData.get("schoolName") ?? "") || undefined,
    assignedUfukStaffId,
    guardianName: String(formData.get("guardianName") ?? "").trim(),
    guardianRelationship: String(formData.get("guardianRelationship") ?? "").trim(),
    guardianPhone: String(formData.get("guardianPhone") ?? "") || undefined,
    guardianAddress: String(formData.get("guardianAddress") ?? "") || undefined,
    householdNotes: String(formData.get("householdNotes") ?? "") || undefined,
  };

  if (!input.displayName || !input.fullName || !input.dateOfBirth || !input.region || !input.guardianName) {
    return { error: "Please fill in all required fields (marked with *)." };
  }

  try {
    const child = await createChild(input, session.user.id);
    redirect(`/implementer/children/${child.id}`);
  } catch (error) {
    if (error instanceof ChildError) return { error: error.message };
    throw error;
  }
}
