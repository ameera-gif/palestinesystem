"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { uploadMedia, MediaError } from "@/lib/services/media";

export type MediaFormState = { error?: string; success?: boolean } | null;

export async function uploadMediaAction(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  const session = await requireRole("UFUK");
  if (!session.user.profileId) return { error: "Field staff profile not found." };

  const childId = String(formData.get("childId") ?? "");
  const fileUrl = String(formData.get("fileUrl") ?? "");
  const type = String(formData.get("type") ?? "PHOTO") as "PHOTO" | "VIDEO" | "DOCUMENT";
  const description = String(formData.get("description") ?? "") || undefined;
  const purpose = String(formData.get("purpose") ?? "") || undefined;
  const visibility = String(formData.get("visibility") ?? "INTERNAL") as "INTERNAL" | "SPONSOR_ONLY" | "PUBLIC_APPROVED";
  const consentConfirmed = formData.get("consentConfirmed") === "on";

  if (!childId || !fileUrl) return { error: "Please choose a child and upload a file." };

  try {
    await uploadMedia(session.user.profileId, { childId, type, fileUrl, description, purpose, visibility, consentConfirmed });
    revalidatePath("/implementer/media");
    return { success: true };
  } catch (error) {
    if (error instanceof MediaError) return { error: error.message };
    throw error;
  }
}
