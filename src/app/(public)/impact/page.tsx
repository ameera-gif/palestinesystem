import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Our Impact — MyFundAction" };

export default async function ImpactPage() {
  const [sponsoredCount, reportsPublished, verifiedDistributions, activeSponsors] = await Promise.all([
    prisma.child.count({ where: { status: "SPONSORED" } }),
    prisma.report.count({ where: { status: "PUBLISHED" } }),
    prisma.distributionRecord.count({ where: { status: "VERIFIED" } }),
    prisma.sponsor.count({ where: { sponsorships: { some: { status: "ACTIVE" } } } }),
  ]);

  const stats = [
    { label: "Children currently sponsored", value: sponsoredCount },
    { label: "Verified progress reports published", value: reportsPublished },
    { label: "Verified support deliveries", value: verifiedDistributions },
    { label: "Active sponsors worldwide", value: activeSponsors },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">Our Impact</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Aggregate, non-identifying figures from the Gaza child sponsorship programme — every underlying report and
        delivery has been individually reviewed and verified by MyFundAction.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-4xl font-semibold text-brand-dark">{s.value}</p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 prose-sm text-sm text-ink max-w-2xl space-y-4">
        <p>
          Every number above traces back to an individually reviewed record: a report Ufuk submitted and MyFundAction
          approved, or a support delivery Ufuk documented and MyFundAction verified. We don't publish impact figures
          we haven't personally checked.
        </p>
      </div>
    </div>
  );
}
