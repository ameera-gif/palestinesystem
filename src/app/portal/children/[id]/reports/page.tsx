import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSponsorChildOrNotFound } from "@/lib/services/sponsor-access";
import { ChildTabs } from "@/components/portal/child-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { periodLabel, formatDate } from "@/lib/format";

export default async function SponsorChildReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const sponsorship = await getSponsorChildOrNotFound(session!.user.profileId!, id);

  // Sponsors only ever see PUBLISHED reports — this is the whole point of
  // the review workflow. Draft/submitted/under-review/returned stay internal.
  const reports = await prisma.report.findMany({
    where: { childId: id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">{sponsorship.child.displayName}</h1>
      <ChildTabs childId={id} />

      {reports.length === 0 ? (
        <EmptyState
          title="No published reports yet"
          description="MyFundAction publishes a verified progress report once Ufuk submits one and it's been reviewed."
        />
      ) : (
        <div className="space-y-5">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle>{periodLabel(report.reportingPeriodStart, report.reportingPeriodEnd)} Progress Report</CardTitle>
                <p className="text-xs text-muted mt-1">Published {formatDate(report.publishedAt)} · Verified by MyFundAction</p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-ink">
                {report.narrativeUpdate && (
                  <div>
                    <p className="font-semibold mb-1">Update</p>
                    <p className="text-muted">{report.narrativeUpdate}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  {report.academicProgress && (
                    <div>
                      <p className="font-semibold mb-1">Academic progress</p>
                      <p className="text-muted">{report.academicProgress}</p>
                    </div>
                  )}
                  {report.attendanceSummary && (
                    <div>
                      <p className="font-semibold mb-1">Attendance</p>
                      <p className="text-muted">{report.attendanceSummary}</p>
                    </div>
                  )}
                  {report.achievements && (
                    <div>
                      <p className="font-semibold mb-1">Achievements</p>
                      <p className="text-muted">{report.achievements}</p>
                    </div>
                  )}
                  {report.currentNeeds && (
                    <div>
                      <p className="font-semibold mb-1">Current needs</p>
                      <p className="text-muted">{report.currentNeeds}</p>
                    </div>
                  )}
                </div>
                {report.guardianRemarks && (
                  <div>
                    <p className="font-semibold mb-1">Guardian's note</p>
                    <p className="text-muted italic">"{report.guardianRemarks}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
