import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { formatDate, calculateAge, formatMoney } from "@/lib/format";
import { StatusChangeForm } from "@/app/implementer/children/[id]/status-form";

export default async function ManagementChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      guardian: true,
      consents: true,
      statusHistory: { orderBy: { changedAt: "desc" } },
      assignedUfukStaff: true,
      reports: { orderBy: { createdAt: "desc" }, take: 8 },
      distributions: { include: { batch: true }, orderBy: { createdAt: "desc" }, take: 8 },
      sponsorships: { include: { sponsor: true }, orderBy: { createdAt: "desc" } },
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
              {child.fullName} · {calculateAge(child.dateOfBirth)} yrs · {child.region} · Ufuk: {child.assignedUfukStaff?.name ?? "Unassigned"}
            </p>
          </div>
        </div>
        <StatusBadge status={child.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Support Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {child.distributions.length === 0 ? (
                <p className="text-sm text-muted">No distribution records yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {child.distributions.map((d) => (
                    <div key={d.id} className="py-2 flex items-center justify-between text-sm">
                      <span className="text-ink">
                        {d.batch.label} · {formatMoney(d.actualAmount ?? d.expectedAmount, d.currency)}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-danger/30">
            <CardHeader>
              <CardTitle>Guardian / Household — Restricted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-ink">
              {child.guardian ? (
                <>
                  <p>{child.guardian.name} ({child.guardian.relationship})</p>
                  <p className="text-muted">{child.guardian.phone}</p>
                  <p className="text-muted">{child.guardian.address}</p>
                </>
              ) : (
                <p className="text-muted">No guardian record on file.</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Sponsorship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {child.sponsorships.length === 0 && <p className="text-muted">No sponsorship on record.</p>}
              {child.sponsorships.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-ink">{s.sponsor.displayName}</span>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {child.statusHistory.map((h) => (
                <div key={h.id}>
                  <p className="text-ink">{h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Registered as ${h.toStatus}`}</p>
                  <p className="text-muted text-xs">{h.reason}</p>
                  <p className="text-muted text-xs">{formatDate(h.changedAt)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
