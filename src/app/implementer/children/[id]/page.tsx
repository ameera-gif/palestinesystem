import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { formatDate, calculateAge } from "@/lib/format";
import { StatusChangeForm } from "./status-form";

export default async function UfukChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      guardian: true,
      consents: true,
      statusHistory: { orderBy: { changedAt: "desc" } },
      assignedUfukStaff: true,
      reports: { orderBy: { createdAt: "desc" }, take: 5 },
      sponsorships: { where: { status: { in: ["ACTIVE", "PENDING"] } }, include: { sponsor: true } },
    },
  });
  if (!child) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl overflow-hidden bg-brand-light shrink-0">
            {child.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={child.photoUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              {child.displayName} <span className="text-muted font-normal text-base">({child.childCode})</span>
            </h1>
            <p className="text-sm text-muted">
              {child.fullName} · {calculateAge(child.dateOfBirth)} yrs · {child.region}
            </p>
          </div>
        </div>
        <StatusBadge status={child.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-ink">
              <p>
                <span className="text-muted">Bio:</span> {child.bio || "—"}
              </p>
              <p>
                <span className="text-muted">Interests:</span> {child.interests || "—"}
              </p>
              <p>
                <span className="text-muted">Aspirations:</span> {child.aspirations || "—"}
              </p>
              <p>
                <span className="text-muted">Education:</span> {child.educationStage || "—"} · {child.schoolName || "—"}
              </p>
              <p>
                <span className="text-muted">Assigned Ufuk staff:</span> {child.assignedUfukStaff?.name ?? "Unassigned"}
              </p>
              <div className="pt-2">
                <Button href={`/implementer/reports/new?childId=${child.id}`} size="sm">
                  New Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-danger/30">
            <CardHeader>
              <CardTitle>Guardian / Household — Restricted</CardTitle>
              <p className="text-xs text-danger mt-1">Never shown to sponsors or the public.</p>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-ink">
              {child.guardian ? (
                <>
                  <p>
                    {child.guardian.name} ({child.guardian.relationship})
                  </p>
                  <p className="text-muted">{child.guardian.phone}</p>
                  <p className="text-muted">{child.guardian.address}</p>
                  {child.guardian.householdNotes && <p className="text-muted mt-2">{child.guardian.householdNotes}</p>}
                </>
              ) : (
                <p className="text-muted">No guardian record on file.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {child.reports.length === 0 ? (
                <p className="text-sm text-muted">No reports yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {child.reports.map((r) => (
                    <div key={r.id} className="py-2 flex items-center justify-between text-sm">
                      <span className="text-ink">{formatDate(r.reportingPeriodEnd)}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChangeForm childId={child.id} currentStatus={child.status} />
            </CardContent>
          </Card>

          {child.sponsorships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sponsorship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {child.sponsorships.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-ink">{s.sponsor.displayName}</span>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {child.statusHistory.map((h) => (
                <div key={h.id}>
                  <p className="text-ink">
                    {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Registered as ${h.toStatus}`}
                  </p>
                  <p className="text-muted text-xs">{h.reason}</p>
                  <p className="text-muted text-xs">{formatDate(h.changedAt)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {child.consents.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-ink capitalize">{c.consentType.replace("_", " ")}</span>
                  <StatusBadge status={c.granted ? "APPROVED" : "PENDING"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
