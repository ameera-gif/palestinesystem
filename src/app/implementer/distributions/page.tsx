import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatMoney } from "@/lib/format";

export default async function UfukDistributionsPage() {
  const batches = await prisma.distributionBatch.findMany({
    include: { records: true, createdByUfuk: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-ink">Distribution Batches</h1>
        <Button href="/implementer/distributions/new" size="sm">
          + Create Distribution Batch
        </Button>
      </div>

      {batches.length === 0 ? (
        <EmptyState title="No distribution batches yet" />
      ) : (
        <div className="space-y-4">
          {batches.map((b) => {
            const verified = b.records.filter((r) => r.status === "VERIFIED").length;
            const total = b.records.length;
            const totalExpected = b.records.reduce((sum, r) => sum + r.expectedAmount, 0);
            return (
              <Card key={b.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/implementer/distributions/${b.id}`} className="font-semibold text-ink hover:text-brand">
                      {b.label}
                    </Link>
                    <p className="text-sm text-muted mt-0.5">
                      {formatDate(b.periodStart)} – {formatDate(b.periodEnd)} · {total} children · {formatMoney(totalExpected, "USD")} expected
                    </p>
                  </div>
                  <div className="text-sm text-muted">
                    {verified}/{total} verified
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
