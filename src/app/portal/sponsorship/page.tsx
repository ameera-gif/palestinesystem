import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { formatDate, formatMoney } from "@/lib/format";

export default async function SponsorBillingPage() {
  const session = await auth();
  const sponsorships = await prisma.sponsorship.findMany({
    where: { sponsorId: session!.user.profileId! },
    include: { child: true, transactions: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Sponsorship & Contributions</h1>
      {sponsorships.map((s) => (
        <Card key={s.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{s.child.displayName}</CardTitle>
              <StatusBadge status={s.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <p className="text-muted">Monthly amount</p>
                <p className="font-medium text-ink">{formatMoney(s.monthlyAmount, s.currency)}</p>
              </div>
              <div>
                <p className="text-muted">Billed</p>
                <p className="font-medium text-ink">{s.paymentFrequency === "QUARTERLY" ? "Every 3 months" : "Monthly"}</p>
              </div>
              <div>
                <p className="text-muted">Started</p>
                <p className="font-medium text-ink">{formatDate(s.startDate)}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-ink mb-2">Contribution history</p>
            <div className="divide-y divide-border">
              {s.transactions.length === 0 && <p className="text-sm text-muted py-2">No contributions recorded yet.</p>}
              {s.transactions.map((t) => (
                <div key={t.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-ink">{t.periodLabel}</span>
                  <span className="text-muted">{formatDate(t.paidAt)}</span>
                  <span className="font-medium text-ink">{formatMoney(t.amount, t.currency)}</span>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
