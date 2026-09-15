import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatMoney } from "@/lib/format";
import { pauseSponsorshipAction, resumeSponsorshipAction } from "./actions";

export default async function SponsorshipsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const where: Prisma.SponsorshipWhereInput = status ? { status: status as Prisma.EnumSponsorshipStatusFilter["equals"] } : {};

  const sponsorships = await prisma.sponsorship.findMany({
    where,
    include: { sponsor: true, child: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Sponsorships</h1>

      <form className="flex gap-3 mb-6">
        <Select name="status" defaultValue={status ?? ""} className="w-56">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="PAYMENT_ISSUE">Payment Issue</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {sponsorships.length === 0 ? (
        <EmptyState title="No sponsorships found" />
      ) : (
        <div className="space-y-3">
          {sponsorships.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {s.sponsor.displayName} → {s.child.displayName}
                  </p>
                  <p className="text-xs text-muted">
                    {formatMoney(s.monthlyAmount, s.currency)}/month · Started {formatDate(s.startDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={s.status} />
                  {s.status === "ACTIVE" && (
                    <details className="relative">
                      <summary className="text-sm text-brand font-medium cursor-pointer list-none">Pause…</summary>
                      <form action={pauseSponsorshipAction.bind(null, s.id)} className="absolute right-0 mt-2 z-10 w-64 bg-surface border border-border rounded-lg p-3 shadow-md space-y-2">
                        <Textarea name="reason" placeholder="Reason for pausing" required className="text-xs min-h-16" />
                        <Button type="submit" size="sm" variant="outline">
                          Confirm Pause
                        </Button>
                      </form>
                    </details>
                  )}
                  {s.status === "PAUSED" && (
                    <form action={resumeSponsorshipAction.bind(null, s.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        Resume
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
