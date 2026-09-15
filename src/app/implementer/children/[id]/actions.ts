"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { changeChildStatus, ChildError } from "@/lib/services/children";

export async function changeStatusAction(
  childId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const session = await requireRole("UFUK", "MYFUNDACTION_PC", "ADMIN");
  const toStatus = String(formData.get("toStatus") ?? "");
  const reason = String(formData.get("reason") ?? "");

  try {
    await changeChildStatus(childId, toStatus, reason, session.user.id);
    revalidatePath(`/implementer/children/${childId}`);
    revalidatePath(`/management/children/${childId}`);
    return null;
  } catch (error) {
    if (error instanceof ChildError) return { error: error.message };
    throw error;
  }
}
