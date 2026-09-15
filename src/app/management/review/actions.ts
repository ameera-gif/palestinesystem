"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { reviewReport, publishReport } from "@/lib/services/reports";
import { verifyDistribution, flagDistributionIssue } from "@/lib/services/distributions";
import { reviewMedia } from "@/lib/services/media";
import { moderateMessage } from "@/lib/services/messages";
import { confirmSponsorshipRequest } from "@/lib/services/sponsorship";

async function pcSession() {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");
  if (!session.user.profileId) throw new Error("Only a MyFundAction Project Coordinator profile can review submissions.");
  return session;
}

export async function approveReportAction(reportId: string, formData: FormData) {
  const session = await pcSession();
  const comment = String(formData.get("comment") ?? "") || undefined;
  await reviewReport(reportId, "APPROVED", session.user.profileId!, session.user.id, comment);
  revalidatePath("/management/review");
}

export async function returnReportAction(reportId: string, formData: FormData) {
  const session = await pcSession();
  const comment = String(formData.get("comment") ?? "");
  await reviewReport(reportId, "RETURNED", session.user.profileId!, session.user.id, comment);
  revalidatePath("/management/review");
}

export async function publishReportAction(reportId: string) {
  const session = await pcSession();
  await publishReport(reportId, session.user.id);
  revalidatePath("/management/review");
}

export async function verifyDistributionAction(recordId: string) {
  const session = await pcSession();
  await verifyDistribution(recordId, session.user.profileId!, session.user.id);
  revalidatePath("/management/review");
}

export async function flagDistributionAction(recordId: string, formData: FormData) {
  const session = await pcSession();
  const issueNotes = String(formData.get("issueNotes") ?? "Issue flagged by MyFundAction.");
  await flagDistributionIssue(recordId, session.user.id, issueNotes);
  revalidatePath("/management/review");
}

export async function approveMediaAction(mediaId: string, formData: FormData) {
  const session = await pcSession();
  const visibility = String(formData.get("visibility") ?? "SPONSOR_ONLY") as "INTERNAL" | "SPONSOR_ONLY" | "PUBLIC_APPROVED";
  await reviewMedia(mediaId, true, session.user.profileId!, session.user.id, visibility);
  revalidatePath("/management/review");
}

export async function rejectMediaAction(mediaId: string, formData: FormData) {
  const session = await pcSession();
  const comment = String(formData.get("comment") ?? "") || undefined;
  await reviewMedia(mediaId, false, session.user.profileId!, session.user.id, undefined, comment);
  revalidatePath("/management/review");
}

export async function moderateMessageAction(messageId: string, approve: boolean) {
  const session = await pcSession();
  await moderateMessage(messageId, approve, session.user.id);
  revalidatePath("/management/review");
}

export async function confirmSponsorshipAction(sponsorshipId: string): Promise<void> {
  const session = await pcSession();
  // A SponsorshipError here means someone else already actioned this request
  // (e.g. two PCs racing the same queue item) — surfacing that as a crashed
  // page is acceptable for this rare edge case in an internal review tool.
  await confirmSponsorshipRequest(sponsorshipId, session.user.profileId!, session.user.id);
  revalidatePath("/management/review");
  revalidatePath("/management/sponsorships");
}
