"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { createSponsorshipRequest, stubConfirmPayment, SponsorshipError } from "@/lib/services/sponsorship";

export async function requestSponsorshipAction(childId: string): Promise<{ error?: string; success?: boolean }> {
  const session = await requireRole("SPONSOR");
  if (!session.user.profileId) return { error: "Your sponsor profile could not be found." };

  try {
    const sponsorship = await createSponsorshipRequest(session.user.profileId, childId);
    await stubConfirmPayment(sponsorship.id);
    revalidatePath("/portal");
    return { success: true };
  } catch (error) {
    if (error instanceof SponsorshipError) return { error: error.message };
    throw error;
  }
}
