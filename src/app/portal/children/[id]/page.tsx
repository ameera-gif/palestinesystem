import { auth } from "@/auth";
import { toSponsorChildView } from "@/lib/mappers/child";
import { getSponsorChildOrNotFound } from "@/lib/services/sponsor-access";
import { buildJourneyEvents } from "@/lib/services/journey";
import { ChildTabs } from "@/components/portal/child-tabs";
import { JourneyTimeline } from "@/components/portal/journey-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";

export default async function SponsorChildProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const sponsorship = await getSponsorChildOrNotFound(session!.user.profileId!, id);
  const child = toSponsorChildView(sponsorship.child);
  const events = await buildJourneyEvents(child.id, sponsorship.startDate);
  const latest = events[events.length - 1];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="h-16 w-16 rounded-xl overflow-hidden bg-brand-light shrink-0">
          {child.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={child.photoUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">{child.displayName}</h1>
          <p className="text-sm text-muted">
            {child.age} years old · {child.gender === "MALE" ? "Boy" : "Girl"} · {child.region}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={sponsorship.status} />
        </div>
      </div>

      <ChildTabs childId={id} />

      {sponsorship.status === "PENDING" ? (
        <Card className="mb-6 border-info/20 bg-info-light/40">
          <CardContent className="pt-5">
            <p className="text-sm text-ink">
              Your request has been submitted. MyFundAction is confirming the match. {child.displayName}&rsquo;s journey
              will appear here once your sponsorship is active.
            </p>
          </CardContent>
        </Card>
      ) : (
        latest && (
          <Card className="mb-6 border-brand/20 bg-brand-light/40">
            <CardContent className="pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">Latest from {child.displayName}</p>
              <p className="mt-1 text-sm text-ink">{latest.summary}</p>
            </CardContent>
          </Card>
        )
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {sponsorship.status !== "PENDING" && (
            <Card>
              <CardContent className="pt-5">
                <JourneyTimeline events={events} />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>About {child.displayName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-ink">
              {child.bio && <p>{child.bio}</p>}
              {child.interests && (
                <p>
                  <span className="font-medium">Enjoys:</span> {child.interests}
                </p>
              )}
              {child.aspirations && (
                <p>
                  <span className="font-medium">Dreams of:</span> {child.aspirations}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink">{child.educationStage ?? "—"}</CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sponsorship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-ink">
              <p>
                <span className="text-muted">Started:</span> {formatDate(sponsorship.startDate)}
              </p>
              <p>
                <span className="text-muted">Status:</span> <StatusBadge status={sponsorship.status} />
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
