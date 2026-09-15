import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export default async function SponsorMeetingsPage() {
  const session = await auth();
  const meetings = await prisma.meeting.findMany({
    where: { sponsorId: session!.user.profileId! },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">Meetings</h1>
      <p className="text-sm text-muted mb-6">
        Sponsor-child meetings happen roughly every six months and are always facilitated by a MyFundAction or field
        partner representative.
      </p>

      {meetings.length === 0 ? (
        <EmptyState title="No meetings yet" description="MyFundAction will reach out when a meeting is due to be scheduled." />
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {m.child.displayName} · {m.cycleLabel}
                  </p>
                  <p className="text-sm text-muted mt-0.5">
                    {m.scheduledDate ? `Scheduled for ${formatDate(m.scheduledDate)}${m.timezone ? ` (${m.timezone})` : ""}` : "Date to be confirmed"}
                  </p>
                  {m.sponsorVisibleNotes && <p className="text-sm text-ink mt-1">{m.sponsorVisibleNotes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={m.status} />
                  {m.status === "SCHEDULED" && m.meetingLink && (
                    <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand">
                      Join link →
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
