"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { pauseSponsorship, resumeSponsorship } from "@/lib/services/sponsorship";

export async function pauseSponsorshipAction(sponsorshipId: string, formData: FormData) {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");
  const reason = String(formData.get("reason") ?? "Paused by MyFundAction.");
  await pauseSponsorship(sponsorshipId, reason, session.user.id);
  revalidatePath("/management/sponsorships");
}

export async function resumeSponsorshipAction(sponsorshipId: string) {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");
  await resumeSponsorship(sponsorshipId, session.user.id);
  revalidatePath("/management/sponsorships");
}
