import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { formatDate, formatMoney } from "@/lib/format";

export default async function SponsorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
    include: {
      user: true,
      sponsorships: { include: { child: true, transactions: true } },
      meetings: { include: { child: true } },
      messages: { include: { child: true } },
    },
  });
  if (!sponsor) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">{sponsor.displayName}</h1>
      <p className="text-sm text-muted mb-6">
        {sponsor.user.email} · {sponsor.country ?? "—"} · Joined {formatDate(sponsor.createdAt)}
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sponsorships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sponsor.sponsorships.map((s) => (
                <div key={s.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-ink">{s.child.displayName}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm text-muted">
                    {formatMoney(s.monthlyAmount, s.currency)}/month · Started {formatDate(s.startDate)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sponsor.messages.length === 0 && <p className="text-sm text-muted">No messages yet.</p>}
              {sponsor.messages.map((m) => (
                <div key={m.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                  <p className="text-ink">
                    {m.direction === "SPONSOR_TO_CHILD" ? "To" : "From"} {m.child.displayName}: {m.content}
                  </p>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {sponsor.meetings.length === 0 && <p className="text-muted">No meetings yet.</p>}
              {sponsor.meetings.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="text-ink">{m.child.displayName}</span>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
