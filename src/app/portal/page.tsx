import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toSponsorChildView } from "@/lib/mappers/child";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatMoney, monthsBetween } from "@/lib/format";

export default async function SponsorDashboard() {
  const session = await auth();
  const sponsorId = session!.user.profileId!;

  const sponsorships = await prisma.sponsorship.findMany({
    where: { sponsorId },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });

  if (sponsorships.length === 0) {
    return (
      <EmptyState
        title="You haven't sponsored a child yet"
        description="Browse available children and start a sponsorship — every update you receive is verified by MyFundAction."
        action={
          <Button href="/sponsor-a-child" size="sm">
            Sponsor a Child
          </Button>
        }
      />
    );
  }

  const withDetails = await Promise.all(
    sponsorships.map(async (s) => {
      const [latestReport, latestDistribution, nextMeeting] = await Promise.all([
        prisma.report.findFirst({ where: { childId: s.childId, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }),
        prisma.distributionRecord.findFirst({ where: { childId: s.childId, status: "VERIFIED" }, orderBy: { verifiedAt: "desc" } }),
        prisma.meeting.findFirst({
          where: { childId: s.childId, sponsorId, status: { in: ["SCHEDULED", "DUE", "AWAITING_UFUK", "COORDINATING"] } },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      return { sponsorship: s, latestReport, latestDistribution, nextMeeting };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">My Sponsored Children</h1>
        <p className="text-sm text-muted mt-1">
          Every update below has been reviewed and verified by MyFundAction before reaching you.
        </p>
      </div>

      {withDetails.map(({ sponsorship, latestReport, latestDistribution, nextMeeting }) => {
        const child = toSponsorChildView(sponsorship.child);
        const monthsSponsored = sponsorship.startDate ? monthsBetween(new Date(sponsorship.startDate), new Date()) : 0;

        return (
          <Card key={sponsorship.id} className="overflow-hidden">
            <div className="p-5 sm:p-6 grid sm:grid-cols-[120px_1fr] gap-5">
              <Link href={`/portal/children/${child.id}`} className="block">
                <div className="aspect-square rounded-xl overflow-hidden bg-brand-light">
                  {child.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={child.photoUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              </Link>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link href={`/portal/children/${child.id}`} className="text-lg font-semibold text-ink hover:text-brand">
                      {child.displayName}
                    </Link>
                    <p className="text-sm text-muted">
                      {child.age} years old · {child.region} · {child.educationStage}
                    </p>
                  </div>
                  <StatusBadge status={sponsorship.status} />
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted">Sponsoring for</p>
                    <p className="font-medium text-ink">{monthsSponsored} months</p>
                  </div>
                  <div>
                    <p className="text-muted">Latest report</p>
                    <p className="font-medium text-ink">
                      {latestReport ? formatDate(latestReport.publishedAt) : "None published yet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Latest support delivered</p>
                    <p className="font-medium text-ink">
                      {latestDistribution
                        ? `${formatMoney(latestDistribution.actualAmount ?? latestDistribution.expectedAmount, latestDistribution.currency)} · ${formatDate(latestDistribution.verifiedAt)}`
                        : "Pending first delivery"}
                    </p>
                  </div>
                </div>

                {nextMeeting && (
                  <div className="mt-3 rounded-lg bg-info-light text-info text-sm px-3 py-2">
                    Next meeting: <StatusBadge status={nextMeeting.status} />
                    {nextMeeting.scheduledDate && ` — ${formatDate(nextMeeting.scheduledDate)}`}
                  </div>
                )}
                {sponsorship.status === "PAUSED" && sponsorship.pausedReason && (
                  <div className="mt-3 rounded-lg bg-warning-light text-warning text-sm px-3 py-2">
                    Paused: {sponsorship.pausedReason}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button href={`/portal/children/${child.id}`} size="sm">
                    View Profile
                  </Button>
                  <Button href={`/portal/children/${child.id}/reports`} variant="outline" size="sm">
                    Reports
                  </Button>
                  <Button href={`/portal/children/${child.id}/support`} variant="outline" size="sm">
                    Support Updates
                  </Button>
                  <Button href={`/portal/children/${child.id}/media`} variant="outline" size="sm">
                    Photos & Videos
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
