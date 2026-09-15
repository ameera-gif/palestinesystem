import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ReportForm } from "../report-form";

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ childId?: string }> }) {
  const { childId } = await searchParams;
  const children = await prisma.child.findMany({
    where: { status: "SPONSORED" },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink mb-1">New Progress Report</h1>
      <p className="text-sm text-muted mb-6">Save as draft anytime, or submit when ready for MyFundAction's review.</p>
      <Card>
        <CardContent className="pt-6">
          <ReportForm children={children} defaultChildId={childId} />
        </CardContent>
      </Card>
    </div>
  );
}
