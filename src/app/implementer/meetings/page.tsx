import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { confirmAvailabilityAction } from "./actions";

export default async function UfukMeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    include: { child: true, sponsor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">Sponsor Meetings</h1>
      <p className="text-sm text-muted mb-6">
        Confirm a child&rsquo;s availability when MyFundAction requests it. A MyFundAction or field partner representative always
        facilitates the meeting.
      </p>

      {meetings.length === 0 ? (
        <EmptyState title="No meetings yet" />
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {m.child.displayName} · {m.cycleLabel}
                  </p>
                  <p className="text-sm text-muted">Sponsor: {m.sponsor.displayName}</p>
                  {m.scheduledDate && <p className="text-sm text-muted">{formatDate(m.scheduledDate)}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={m.status} />
                  {m.status === "AWAITING_UFUK" && (
                    <form action={confirmAvailabilityAction.bind(null, m.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        Confirm Availability
                      </Button>
                    </form>
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
