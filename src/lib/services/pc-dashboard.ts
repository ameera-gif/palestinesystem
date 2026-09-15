import { prisma } from "@/lib/prisma";

/** Programme-wide KPIs for the MyFundAction dashboard — overdue-first, not chart-first. */
export async function getPcDashboardData() {
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
  };
}
