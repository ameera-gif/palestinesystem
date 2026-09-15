"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { requestUfukAvailability, scheduleMeeting, completeMeeting, cancelMeeting } from "@/lib/services/meetings";

async function pcSession() {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");
  if (!session.user.profileId) throw new Error("Only a MyFundAction Project Coordinator profile can manage meetings.");
  return session;
}

export async function requestAvailabilityAction(formData: FormData) {
  const session = await pcSession();
  const [childId, sponsorId] = String(formData.get("sponsorshipPair") ?? "").split("::");
  const cycleLabel = String(formData.get("cycleLabel") ?? "");
  if (!childId || !sponsorId || !cycleLabel) return;
  await requestUfukAvailability(childId, sponsorId, cycleLabel, session.user.profileId!, session.user.id);
  revalidatePath("/management/meetings");
}

export async function scheduleMeetingAction(meetingId: string, formData: FormData) {
  const session = await pcSession();
  await scheduleMeeting(
    meetingId,
    {
      scheduledDate: String(formData.get("scheduledDate") ?? ""),
      timezone: String(formData.get("timezone") ?? "UTC"),
      platform: (formData.get("platform") as "GOOGLE_MEET" | "ZOOM" | "TEAMS" | "OTHER") ?? "GOOGLE_MEET",
      meetingLink: String(formData.get("meetingLink") ?? ""),
    },
    session.user.id,
  );
  revalidatePath("/management/meetings");
}

export async function completeMeetingAction(meetingId: string) {
  const session = await pcSession();
  await completeMeeting(meetingId, session.user.id);
  revalidatePath("/management/meetings");
}

export async function cancelMeetingAction(meetingId: string, formData: FormData) {
  const session = await pcSession();
  const reason = String(formData.get("reason") ?? "Cancelled by MyFundAction.");
  await cancelMeeting(meetingId, reason, session.user.id);
  revalidatePath("/management/meetings");
}
