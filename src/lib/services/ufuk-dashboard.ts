import { prisma } from "@/lib/prisma";
import { getProgrammeSettings } from "@/lib/settings";

/**
 * Everything Ufuk's dashboard needs to answer "what do I need to update or
 * submit?" — queue counts, not vanity charts, per the brief.
 */
export async function getUfukDashboardData(ufukId: string) {
  const settings = await getProgrammeSettings();
  const cycleCutoff = new Date();
  cycleCutoff.setMonth(cycleCutoff.getMonth() - settings.reportingCycleMonths);

  const [
    totalChildren,
    activeChildren,
    sponsoredChildren,
    awaitingSponsorship,
    reportsDue,
    reportsOverdue,
    reportsReturned,
    distributionsDue,
    evidencePending,
  ] = await Promise.all([
    prisma.child.count({ where: { assignedUfukStaffId: ufukId } }),
    prisma.child.count({ where: { assignedUfukStaffId: ufukId, status: { in: ["AVAILABLE", "SPONSORED", "ON_HOLD"] } } }),
    prisma.child.count({ where: { assignedUfukStaffId: ufukId, status: "SPONSORED" } }),
    prisma.child.count({ where: { assignedUfukStaffId: ufukId, status: "AVAILABLE" } }),
    prisma.child.findMany({
      where: {
        assignedUfukStaffId: ufukId,
        status: "SPONSORED",
        reports: { none: { reportingPeriodEnd: { gte: cycleCutoff } } },
      },
      select: { id: true },
    }),
    prisma.report.count({
      where: { child: { assignedUfukStaffId: ufukId }, status: "DRAFT", createdAt: { lt: cycleCutoff } },
    }),
    prisma.report.count({ where: { child: { assignedUfukStaffId: ufukId }, status: "RETURNED" } }),
    prisma.distributionRecord.count({
      where: { child: { assignedUfukStaffId: ufukId }, status: "PLANNED" },
    }),
    prisma.distributionRecord.count({
      where: { child: { assignedUfukStaffId: ufukId }, status: { in: ["EVIDENCE_SUBMITTED"] } },
    }),
  ]);

  return {
    totalChildren,
    activeChildren,
    sponsoredChildren,
    awaitingSponsorship,
    reportsDueCount: reportsDue.length,
    reportsOverdue,
    reportsReturned,
    distributionsDue,
    evidencePending,
  };
}
