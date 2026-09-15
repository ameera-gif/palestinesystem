import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ReportForm } from "../report-form";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const report = await prisma.report.findUnique({ where: { id }, include: { child: true } });
  if (!report || report.submittedByUfukId !== session!.user.profileId) notFound();

  const children = await prisma.child.findMany({
    where: { status: "SPONSORED" },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink mb-1">{report.child.displayName}'s Report</h1>
      <p className="text-sm text-muted mb-6">
        {["DRAFT", "RETURNED"].includes(report.status)
          ? "You can continue editing this report."
          : "This report has been submitted and is read-only."}
      </p>
      <Card>
        <CardContent className="pt-6">
          <ReportForm report={report} children={children} />
        </CardContent>
      </Card>
    </div>
  );
}
