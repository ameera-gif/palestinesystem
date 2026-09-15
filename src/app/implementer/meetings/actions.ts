"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { confirmUfukAvailability } from "@/lib/services/meetings";

export async function confirmAvailabilityAction(meetingId: string, formData: FormData) {
  const session = await requireRole("UFUK");
  const notes = String(formData.get("notes") ?? "") || undefined;
  await confirmUfukAvailability(meetingId, session.user.profileId!, notes);
  revalidatePath("/implementer/meetings");
}
