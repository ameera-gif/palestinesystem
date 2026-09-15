import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Select, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { requestAvailabilityAction, scheduleMeetingAction, completeMeetingAction } from "./actions";

export default async function ManagementMeetingsPage() {
  const [meetings, activeSponsorships] = await Promise.all([
    prisma.meeting.findMany({ include: { child: true, sponsor: true }, orderBy: { createdAt: "desc" } }),
    prisma.sponsorship.findMany({ where: { status: "ACTIVE" }, include: { child: true, sponsor: true } }),
  ]);

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-6">Meetings</h1>
        {meetings.length === 0 ? (
          <EmptyState title="No meetings yet" />
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-ink">
                        {m.child.displayName} · {m.sponsor.displayName}
                      </p>
                      <p className="text-xs text-muted">{m.cycleLabel}{m.scheduledDate && ` · ${formatDate(m.scheduledDate)}`}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>

                  {m.status === "COORDINATING" && (
                    <form action={scheduleMeetingAction.bind(null, m.id)} className="grid sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                      <Input type="datetime-local" name="scheduledDate" required className="text-xs" />
                      <Input name="timezone" placeholder="Timezone e.g. Asia/Kuala_Lumpur" required className="text-xs" />
                      <Select name="platform" defaultValue="GOOGLE_MEET" className="text-xs">
                        <option value="GOOGLE_MEET">Google Meet</option>
                        <option value="ZOOM">Zoom</option>
                        <option value="TEAMS">Microsoft Teams</option>
                        <option value="OTHER">Other</option>
                      </Select>
                      <Input name="meetingLink" placeholder="Meeting link" required className="text-xs" />
                      <Button type="submit" size="sm" className="sm:col-span-2 w-fit">
                        Confirm Schedule
                      </Button>
                    </form>
                  )}
                  {m.status === "SCHEDULED" && (
                    <form action={completeMeetingAction.bind(null, m.id)} className="mt-2">
                      <Button type="submit" size="sm" variant="outline">
                        Mark Completed
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Request availability</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={requestAvailabilityAction} className="space-y-3">
            <Select name="sponsorshipPair" required>
              <option value="">Select sponsored child…</option>
              {activeSponsorships.map((s) => (
                <option key={s.id} value={`${s.childId}::${s.sponsorId}`}>
                  {s.child.displayName} ({s.sponsor.displayName})
                </option>
              ))}
            </Select>
            <Input name="cycleLabel" placeholder="e.g. 2026 H1" required />
            <p className="text-xs text-muted">Sponsor is matched automatically from the child&rsquo;s active sponsorship.</p>
            <Button type="submit" size="sm">
              Request Availability
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
