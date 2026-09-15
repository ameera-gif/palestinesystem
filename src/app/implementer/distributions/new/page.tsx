import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { BatchForm } from "./batch-form";

export default async function NewDistributionBatchPage() {
  const children = await prisma.child.findMany({
    where: { status: "SPONSORED" },
    select: { id: true, displayName: true, childCode: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink mb-1">Create Distribution Batch</h1>
      <p className="text-sm text-muted mb-6">
        Record support delivery for many children at once instead of one at a time.
      </p>
      <Card>
        <CardContent className="pt-6">
          <BatchForm childOptions={children} />
        </CardContent>
      </Card>
    </div>
  );
}
