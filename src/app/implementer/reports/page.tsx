import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { periodLabel } from "@/lib/format";

export default async function UfukReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const session = await auth();

  const where: Prisma.ReportWhereInput = { submittedByUfukId: session!.user.profileId! };
  if (status) where.status = status as Prisma.EnumReportStatusFilter["equals"];

  const reports = await prisma.report.findMany({
    where,
    include: { child: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-ink">Reports</h1>
        <Button href="/implementer/reports/new" size="sm">
          + New Report
        </Button>
      </div>

      <form className="flex gap-3 mb-6">
        <Select name="status" defaultValue={status ?? ""} className="w-56">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RETURNED">Returned for Correction</option>
          <option value="APPROVED">Approved</option>
          <option value="PUBLISHED">Published</option>
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {reports.length === 0 ? (
        <EmptyState title="No reports found" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-3 font-medium">Child</th>
                <th className="p-3 font-medium">Period</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-brand-light/30">
                  <td className="p-3 font-medium text-ink">{r.child.displayName}</td>
                  <td className="p-3 text-muted">{periodLabel(r.reportingPeriodStart, r.reportingPeriodEnd)}</td>
                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-3">
                    <Link href={`/implementer/reports/${r.id}`} className="text-brand font-medium">
                      {["DRAFT", "RETURNED"].includes(r.status) ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
