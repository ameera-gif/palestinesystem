import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { RecordRow } from "./record-row";

export default async function DistributionBatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = await prisma.distributionBatch.findUnique({
    where: { id },
    include: { records: { include: { child: true, evidence: true }, orderBy: { child: { displayName: "asc" } } } },
  });
  if (!batch) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">{batch.label}</h1>
      <p className="text-sm text-muted mb-6">
        {formatDate(batch.periodStart)} – {formatDate(batch.periodEnd)}
        {batch.notes && ` · ${batch.notes}`}
      </p>

      <Card className="overflow-hidden">
        {batch.records.map((r) => (
          <RecordRow
            key={r.id}
            batchId={batch.id}
            record={{
              id: r.id,
              childDisplayName: r.child.displayName,
              childCode: r.child.childCode,
              status: r.status,
              expectedAmount: r.expectedAmount,
              currency: r.currency,
              evidenceCount: r.evidence.length,
            }}
          />
        ))}
      </Card>
    </div>
  );
}
