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

export type UfukTask = {
  id: string;
  urgency: "high" | "medium";
  title: string;
  detail: string;
  cta: string;
  href: string;
};

/**
 * The dashboard's actual work queue — one row per thing Ufuk still has to
 * do, each with a direct link to the exact form/table row where it's
 * finished (the brief's "minimize navigation depth to submit"), rather
 * than a stat tile that only says how many. Sorted so the most overdue
 * items surface first.
 */
export async function getUfukTasks(ufukId: string): Promise<UfukTask[]> {
  const settings = await getProgrammeSettings();
  const cycleCutoff = new Date();
  cycleCutoff.setMonth(cycleCutoff.getMonth() - settings.reportingCycleMonths);

  const [overdueDrafts, returnedReports, childrenNeedingUpdate, evidenceDue] = await Promise.all([
    // Filtered by submittedByUfukId, not the child's current assignment —
    // that's the same field /implementer/reports/[id] checks before letting
    // this user open the report, so a task link here can never 404 against
    // that access check.
    prisma.report.findMany({
      where: { submittedByUfukId: ufukId, status: "DRAFT", createdAt: { lt: cycleCutoff } },
      include: { child: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.report.findMany({
      where: { submittedByUfukId: ufukId, status: "RETURNED" },
      include: { child: true },
      orderBy: { reviewedAt: "asc" },
    }),
    prisma.child.findMany({
      where: {
        assignedUfukStaffId: ufukId,
        status: "SPONSORED",
        reports: { none: { reportingPeriodEnd: { gte: cycleCutoff } } },
      },
      select: { id: true, displayName: true },
    }),
    prisma.distributionRecord.findMany({
      where: { child: { assignedUfukStaffId: ufukId }, status: "PLANNED" },
      include: { child: true, batch: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const tasks: UfukTask[] = [];

  for (const r of returnedReports) {
    tasks.push({
      id: `report-returned-${r.id}`,
      urgency: "high",
      title: `${r.child.displayName}'s report needs amendment`,
      detail: r.currentReviewComment ?? "MyFundAction returned this report for correction.",
      cta: "Respond to Amendment",
      href: `/implementer/reports/${r.id}`,
    });
  }

  for (const r of overdueDrafts) {
    tasks.push({
      id: `report-overdue-${r.id}`,
      urgency: "high",
      title: `${r.child.displayName}'s draft report is overdue`,
      detail: "Started but not yet submitted for this reporting cycle.",
      cta: "Submit Update",
      href: `/implementer/reports/${r.id}`,
    });
  }

  for (const c of childrenNeedingUpdate) {
    tasks.push({
      id: `child-update-${c.id}`,
      urgency: "medium",
      title: `${c.displayName} needs a progress report`,
      detail: "No report has been submitted for the current reporting cycle yet.",
      cta: "Submit Update",
      href: `/implementer/reports/new?childId=${c.id}`,
    });
  }

  for (const d of evidenceDue) {
    tasks.push({
      id: `evidence-${d.id}`,
      urgency: "medium",
      title: `${d.child.displayName}'s quarterly support is due`,
      detail: `${d.batch.label}: record the delivery and attach evidence.`,
      cta: "Upload Evidence",
      href: `/implementer/distributions/${d.batchId}`,
    });
  }

  return tasks.sort((a, b) => (a.urgency === b.urgency ? 0 : a.urgency === "high" ? -1 : 1));
}
