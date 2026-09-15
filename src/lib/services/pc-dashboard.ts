import { prisma } from "@/lib/prisma";

const OVERDUE_REVIEW_DAYS = 5;

/** Programme-wide KPIs for the MyFundAction dashboard — overdue-first, not chart-first. */
export async function getPcDashboardData() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const overdueCutoff = new Date();
  overdueCutoff.setDate(overdueCutoff.getDate() - OVERDUE_REVIEW_DAYS);
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 7);

  const [
    totalChildren,
    eligibleChildren,
    sponsoredChildren,
    unsponsoredChildren,
    activeSponsors,
    reportsAwaitingReview,
    reportsReturned,
    evidenceAwaitingVerification,
    meetingsDue,
    sponsorshipsPaused,
    sponsorshipsPaymentIssue,
    mediaPending,
    reportsApprovedToday,
    reportsOverdueForReview,
    reportsRecentlyPublished,
  ] = await Promise.all([
    prisma.child.count(),
    prisma.child.count({ where: { status: { in: ["ELIGIBLE", "AVAILABLE", "SPONSORED"] } } }),
    prisma.child.count({ where: { status: "SPONSORED" } }),
    prisma.child.count({ where: { status: "AVAILABLE" } }),
    prisma.sponsor.count({ where: { sponsorships: { some: { status: "ACTIVE" } } } }),
    prisma.report.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.report.count({ where: { status: "RETURNED" } }),
    prisma.distributionRecord.count({ where: { status: "EVIDENCE_SUBMITTED" } }),
    prisma.meeting.count({ where: { status: { in: ["DUE", "AWAITING_UFUK", "COORDINATING"] } } }),
    prisma.sponsorship.count({ where: { status: "PAUSED" } }),
    prisma.sponsorship.count({ where: { status: "PAYMENT_ISSUE" } }),
    prisma.media.count({ where: { approvalStatus: "PENDING" } }),
    prisma.report.count({ where: { status: { in: ["APPROVED", "PUBLISHED"] }, approvedAt: { gte: startOfToday } } }),
    prisma.report.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] }, submittedAt: { lt: overdueCutoff } } }),
    prisma.report.count({ where: { status: "PUBLISHED", publishedAt: { gte: recentCutoff } } }),
  ]);

  const pendingSponsorshipRequests = await prisma.sponsorship.count({ where: { status: "PENDING" } });

  return {
    totalChildren,
    eligibleChildren,
    sponsoredChildren,
    unsponsoredChildren,
    activeSponsors,
    reportsAwaitingReview,
    reportsReturned,
    evidenceAwaitingVerification,
    meetingsDue,
    sponsorshipsPaused,
    sponsorshipsPaymentIssue,
    mediaPending,
    pendingSponsorshipRequests,
    reportsApprovedToday,
    reportsOverdueForReview,
    reportsRecentlyPublished,
  };
}
