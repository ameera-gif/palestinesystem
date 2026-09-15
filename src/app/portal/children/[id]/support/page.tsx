import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSponsorChildOrNotFound } from "@/lib/services/sponsor-access";
import { ChildTabs } from "@/components/portal/child-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatMoney } from "@/lib/format";

// Sponsor-facing wording: "Support Update", never "Distribution Record" — the
// brief is explicit that donors shouldn't need NGO operational vocabulary.
export default async function SponsorChildSupportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const sponsorship = await getSponsorChildOrNotFound(session!.user.profileId!, id);

  // Skip for a PENDING match — see the same note in the reports tab.
  const records =
    sponsorship.status === "PENDING"
      ? []
      : await prisma.distributionRecord.findMany({
          where: { childId: id, status: "VERIFIED" },
          include: { batch: true, evidence: true },
          orderBy: { verifiedAt: "desc" },
        });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">{sponsorship.child.displayName}</h1>
      <ChildTabs childId={id} />

      {sponsorship.status === "PENDING" ? (
        <EmptyState title="Sponsorship not yet active" description="Support updates will appear here once MyFundAction confirms your match." />
      ) : records.length === 0 ? (
        <EmptyState title="No verified support updates yet" description="Support updates appear here once MyFundAction verifies delivery." />
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5 flex flex-wrap items-center gap-4 justify-between">
                <div>
                  <p className="font-semibold text-ink">{r.batch.label} Support</p>
                  <p className="text-sm text-muted mt-0.5">Delivered {formatDate(r.distributionDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-brand-dark">
                    {formatMoney(r.actualAmount ?? r.expectedAmount, r.currency)}
                  </p>
                  <div className="mt-1 flex items-center gap-2 justify-end">
                    <StatusPill label="Delivered" tone="success" />
                    <span className="text-xs text-muted">Verified by MyFundAction</span>
                  </div>
                </div>
                {r.evidence.length > 0 && (
                  <div className="w-full pt-3 border-t border-border">
                    <div className="flex gap-2">
                      {r.evidence.slice(0, 3).map((e) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={e.id} src={e.fileUrl} alt="" className="h-16 w-24 rounded-md object-cover border border-border" />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
