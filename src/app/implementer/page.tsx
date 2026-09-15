import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUfukDashboardData, getUfukTasks } from "@/lib/services/ufuk-dashboard";
import { StatTile } from "@/components/ui/stat-tile";
import { TaskList } from "@/components/portal/task-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-pill";
import { formatDateTime } from "@/lib/format";

export default async function UfukDashboard() {
  const session = await auth();
  const ufukId = session!.user.profileId!;
  const [data, tasks] = await Promise.all([getUfukDashboardData(ufukId), getUfukTasks(ufukId)]);

  const recentComments = await prisma.report.findMany({
    where: { submittedByUfukId: ufukId, currentReviewComment: { not: null } },
    orderBy: { reviewedAt: "desc" },
    take: 5,
    include: { child: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Today&rsquo;s Tasks</h1>
        <p className="text-sm text-muted mt-1">Your assigned children, {session!.user.name}.</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <TaskList tasks={tasks} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile label="Total children" value={data.totalChildren} href="/implementer/children" />
        <StatTile label="Sponsored" value={data.sponsoredChildren} href="/implementer/children?status=SPONSORED" />
        <StatTile label="Awaiting sponsorship" value={data.awaitingSponsorship} href="/implementer/children?status=AVAILABLE" />
        <StatTile label="Active profiles" value={data.activeChildren} href="/implementer/children" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink mb-3">Reports</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatTile label="Due this cycle" value={data.reportsDueCount} href="/implementer/reports" tone={data.reportsDueCount > 0 ? "warning" : "neutral"} />
          <StatTile label="Draft overdue" value={data.reportsOverdue} href="/implementer/reports?status=DRAFT" tone={data.reportsOverdue > 0 ? "danger" : "neutral"} />
          <StatTile label="Returned for correction" value={data.reportsReturned} href="/implementer/reports?status=RETURNED" tone={data.reportsReturned > 0 ? "danger" : "neutral"} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink mb-3">Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatTile label="Planned deliveries due" value={data.distributionsDue} href="/implementer/distributions" tone={data.distributionsDue > 0 ? "warning" : "neutral"} />
          <StatTile label="Evidence pending review" value={data.evidencePending} href="/implementer/distributions" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Notifications from MyFundAction</CardTitle>
        </CardHeader>
        <CardContent>
          {recentComments.length === 0 ? (
            <EmptyState title="No comments yet" />
          ) : (
            <div className="space-y-3">
              {recentComments.map((r) => (
                <div key={r.id} className="text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">{r.child.displayName}</span>
                    <StatusBadge status={r.status} domain="report" />
                  </div>
                  <p className="text-muted mt-1">{r.currentReviewComment}</p>
                  <p className="text-xs text-muted mt-1">{formatDateTime(r.reviewedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
