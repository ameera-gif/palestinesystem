import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/services/audit";
import { notifyAllProjectCoordinators, notifyUfukUser, notifySponsorUsersOfSponsor } from "@/lib/services/notifications";

export class ReportError extends Error {}

export type ReportFormInput = {
  childId: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  schoolYear?: string;
  attendanceSummary?: string;
  academicProgress?: string;
  subjectProgress?: string;
  achievements?: string;
  areasForImprovement?: string;
  participationNotes?: string;
  interestsUpdate?: string;
  generalDevelopmentNotes?: string;
  narrativeUpdate?: string;
  challenges?: string;
  currentNeeds?: string;
  nextSteps?: string;
  guardianRemarks?: string;
};

export async function saveReportDraft(ufukId: string, input: ReportFormInput, reportId?: string) {
  const data = {
    childId: input.childId,
    reportingPeriodStart: new Date(input.reportingPeriodStart),
    reportingPeriodEnd: new Date(input.reportingPeriodEnd),
    schoolYear: input.schoolYear,
    attendanceSummary: input.attendanceSummary,
    academicProgress: input.academicProgress,
    subjectProgress: input.subjectProgress,
    achievements: input.achievements,
    areasForImprovement: input.areasForImprovement,
    participationNotes: input.participationNotes,
    interestsUpdate: input.interestsUpdate,
    generalDevelopmentNotes: input.generalDevelopmentNotes,
    narrativeUpdate: input.narrativeUpdate,
    challenges: input.challenges,
    currentNeeds: input.currentNeeds,
    nextSteps: input.nextSteps,
    guardianRemarks: input.guardianRemarks,
  };

  if (reportId) {
    const existing = await prisma.report.findUniqueOrThrow({ where: { id: reportId } });
    if (existing.submittedByUfukId !== ufukId || !["DRAFT", "RETURNED"].includes(existing.status)) {
      throw new ReportError("Only your own draft or returned reports can be edited.");
    }
    return prisma.report.update({ where: { id: reportId }, data });
  }

  return prisma.report.create({
    data: { ...data, status: "DRAFT", submittedByUfukId: ufukId },
  });
}

export async function submitReport(reportId: string, ufukId: string, ufukUserId: string) {
  const report = await prisma.report.findUniqueOrThrow({ where: { id: reportId }, include: { child: true } });
  if (report.submittedByUfukId !== ufukId) throw new ReportError("You can only submit your own reports.");
  if (!["DRAFT", "RETURNED"].includes(report.status)) throw new ReportError("This report has already been submitted.");

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "SUBMITTED", submittedAt: new Date(), currentReviewComment: null },
  });

  await recordAudit({
    actorId: ufukUserId,
    action: "REPORT_SUBMITTED",
    entityType: "Report",
    entityId: reportId,
    summary: `Report for ${report.child.displayName} submitted for MyFundAction review.`,
  });

  await notifyAllProjectCoordinators({
    title: "Report submitted for review",
    body: `A progress report for ${report.child.displayName} is ready for review.`,
    entityType: "Report",
    entityId: reportId,
    link: "/management/review",
  });
}

export async function reviewReport(
  reportId: string,
  decision: "APPROVED" | "RETURNED",
  pcId: string,
  pcUserId: string,
  comment?: string,
) {
  const report = await prisma.report.findUniqueOrThrow({
    where: { id: reportId },
    include: { child: true, submittedByUfuk: true },
  });
  if (!["SUBMITTED", "UNDER_REVIEW"].includes(report.status)) {
    throw new ReportError("Only submitted reports can be reviewed.");
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: {
        status: decision,
        reviewedByPcId: pcId,
        reviewedAt: now,
        approvedAt: decision === "APPROVED" ? now : null,
        currentReviewComment: comment ?? null,
      },
    }),
    prisma.reportReview.create({
      data: { reportId, decision, comment, reviewedById: pcUserId, reviewedAt: now },
    }),
  ]);

  await recordAudit({
    actorId: pcUserId,
    action: decision === "APPROVED" ? "REPORT_APPROVED" : "REPORT_RETURNED",
    entityType: "Report",
    entityId: reportId,
    summary: `Report for ${report.child.displayName} ${decision === "APPROVED" ? "approved" : "returned for correction"}.`,
  });

  if (report.submittedByUfuk) {
    await notifyUfukUser(report.submittedByUfuk.id, {
      title: decision === "APPROVED" ? "Report approved" : "Report returned for correction",
      body:
        decision === "APPROVED"
          ? `Your report for ${report.child.displayName} was approved.`
          : `Your report for ${report.child.displayName} needs corrections: ${comment ?? "see comment"}`,
      entityType: "Report",
      entityId: reportId,
      link: "/implementer/reports",
    });
  }
}

/** Separate from approval so a PC can batch-approve and control the moment sponsors are notified. */
export async function publishReport(reportId: string, pcUserId: string) {
  const report = await prisma.report.findUniqueOrThrow({
    where: { id: reportId },
    include: { child: { include: { sponsorships: { where: { status: "ACTIVE" } } } } },
  });
  if (report.status !== "APPROVED") throw new ReportError("Only approved reports can be published.");

  await prisma.report.update({ where: { id: reportId }, data: { status: "PUBLISHED", publishedAt: new Date() } });

  await recordAudit({
    actorId: pcUserId,
    action: "REPORT_PUBLISHED",
    entityType: "Report",
    entityId: reportId,
    summary: `Report for ${report.child.displayName} published to sponsor.`,
  });

  for (const sponsorship of report.child.sponsorships) {
    await notifySponsorUsersOfSponsor(sponsorship.sponsorId, {
      title: "New report published",
      body: `A new progress report for ${report.child.displayName} is now available.`,
      entityType: "Report",
      entityId: reportId,
      link: `/portal/children/${report.childId}/reports`,
    });
  }
}
