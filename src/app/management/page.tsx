import { getPcDashboardData } from "@/lib/services/pc-dashboard";
import { StatTile } from "@/components/ui/stat-tile";

export default async function ManagementDashboard() {
  const data = await getPcDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Programme Overview</h1>
        <p className="text-sm text-muted mt-1">What's happening, what's overdue, what needs your approval.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Needs your action</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="Reports to review" value={data.reportsAwaitingReview} href="/management/review?tab=reports" tone={data.reportsAwaitingReview > 0 ? "warning" : "neutral"} />
          <StatTile label="Evidence to verify" value={data.evidenceAwaitingVerification} href="/management/review?tab=distributions" tone={data.evidenceAwaitingVerification > 0 ? "warning" : "neutral"} />
          <StatTile label="Media to approve" value={data.mediaPending} href="/management/review?tab=media" tone={data.mediaPending > 0 ? "warning" : "neutral"} />
          <StatTile label="Sponsorship requests" value={data.pendingSponsorshipRequests} href="/management/sponsorships?status=PENDING" tone={data.pendingSponsorshipRequests > 0 ? "warning" : "neutral"} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Follow-up</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="Reports returned" value={data.reportsReturned} href="/management/review?tab=reports" />
          <StatTile label="Meetings due" value={data.meetingsDue} href="/management/meetings" tone={data.meetingsDue > 0 ? "warning" : "neutral"} />
          <StatTile label="Sponsorships paused" value={data.sponsorshipsPaused} href="/management/sponsorships?status=PAUSED" />
          <StatTile label="Payment issues" value={data.sponsorshipsPaymentIssue} href="/management/sponsorships?status=PAYMENT_ISSUE" tone={data.sponsorshipsPaymentIssue > 0 ? "danger" : "neutral"} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Programme size</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="Total children" value={data.totalChildren} href="/management/children" />
          <StatTile label="Eligible / active" value={data.eligibleChildren} href="/management/children" />
          <StatTile label="Sponsored" value={data.sponsoredChildren} href="/management/children?status=SPONSORED" />
          <StatTile label="Awaiting sponsorship" value={data.unsponsoredChildren} href="/management/children?status=AVAILABLE" />
        </div>
      </div>
    </div>
  );
}
