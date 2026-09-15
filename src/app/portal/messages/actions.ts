"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { submitSponsorMessage, MessageError } from "@/lib/services/messages";

export async function sendMessageAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const session = await requireRole("SPONSOR");
  const childId = String(formData.get("childId") ?? "");
  const occasion = String(formData.get("occasion") ?? "General");
  const content = String(formData.get("content") ?? "");

  try {
    await submitSponsorMessage(session.user.profileId!, childId, occasion, content);
    revalidatePath("/portal/messages");
    return null;
  } catch (error) {
    if (error instanceof MessageError) return { error: error.message };
    throw error;
  }
}
