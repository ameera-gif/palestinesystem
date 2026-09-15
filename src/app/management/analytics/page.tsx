import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5">
      <p className="text-3xl font-semibold text-ink tabular-nums">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </Card>
  );
}

function pct(n: number, d: number) {
  if (d === 0) return "—";
  return `${Math.round((n / d) * 100)}%`;
}

export default async function AnalyticsPage() {
  const [
    eligibleChildren,
    sponsoredChildren,
    reportsExpected,
    reportsPublished,
    reportsReturned,
    distributionsExpected,
    distributionsVerified,
    meetingsDue,
    meetingsCompleted,
    completedSponsorships,
    activeSponsorships,
    incompleteProfiles,
  ] = await Promise.all([
    prisma.child.count({ where: { status: { in: ["ELIGIBLE", "AVAILABLE", "SPONSORED"] } } }),
    prisma.child.count({ where: { status: "SPONSORED" } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: "PUBLISHED" } }),
    prisma.report.count({ where: { status: "RETURNED" } }),
    prisma.distributionRecord.count(),
    prisma.distributionRecord.count({ where: { status: "VERIFIED" } }),
    prisma.meeting.count({ where: { status: { not: "NOT_DUE" } } }),
    prisma.meeting.count({ where: { status: "COMPLETED" } }),
    prisma.sponsorship.findMany({ where: { status: "COMPLETED" }, select: { startDate: true, endDate: true } }),
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    prisma.child.count({ where: { OR: [{ bio: null }, { educationStage: null }, { photoUrl: null }] } }),
  ]);

  const avgDurationMonths =
    completedSponsorships.length > 0
      ? Math.round(
          completedSponsorships.reduce((sum, s) => {
            if (!s.startDate || !s.endDate) return sum;
            const months = (s.endDate.getFullYear() - s.startDate.getFullYear()) * 12 + (s.endDate.getMonth() - s.startDate.getMonth());
            return sum + months;
          }, 0) / completedSponsorships.length,
        )
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <p className="text-sm text-muted mt-1">Indicators that inform programme decisions.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Sponsorship coverage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric label="Sponsorship coverage" value={pct(sponsoredChildren, eligibleChildren)} sub={`${sponsoredChildren} of ${eligibleChildren} eligible children`} />
          <Metric label="Active sponsorships" value={String(activeSponsorships)} />
          <Metric label="Avg. sponsorship duration" value={`${avgDurationMonths} mo`} sub="Completed sponsorships" />
          <Metric label="Profiles needing attention" value={String(incompleteProfiles)} sub="Missing bio, education, or photo" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Reporting</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric label="Report completion rate" value={pct(reportsPublished, reportsExpected)} sub={`${reportsPublished} published of ${reportsExpected} total`} />
          <Metric label="Reports returned" value={String(reportsReturned)} sub="Needed correction" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Support distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric label="Distribution verification rate" value={pct(distributionsVerified, distributionsExpected)} sub={`${distributionsVerified} verified of ${distributionsExpected}`} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Meetings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric label="Meeting completion rate" value={pct(meetingsCompleted, meetingsDue)} sub={`${meetingsCompleted} completed of ${meetingsDue} due`} />
        </div>
      </div>
    </div>
  );
}
