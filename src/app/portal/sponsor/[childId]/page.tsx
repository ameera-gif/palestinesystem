import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toPublicChildProfile } from "@/lib/mappers/child";
import { getProgrammeSettings, quarterlyAmount } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { ConfirmSponsorshipButton } from "./confirm-button";

export default async function ConfirmSponsorshipPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const record = await prisma.child.findUnique({ where: { id: childId } });
  if (!record) notFound();

  const child = toPublicChildProfile(record);
  const settings = await getProgrammeSettings();
  const amount = quarterlyAmount(settings);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink">Confirm your sponsorship</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{child.displayName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {child.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={child.photoUrl} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
            )}
            <div>
              <p className="text-sm text-ink">
                {child.age} years old · {child.region}
              </p>
              <p className="text-sm text-muted">{child.educationStage}</p>
            </div>
          </div>
          <div className="rounded-lg bg-brand-light px-4 py-3 text-sm text-ink">
            <p>
              <span className="font-semibold">{formatMoney(settings.monthlySponsorshipAmount, settings.currency)}</span> per month,
              billed as <span className="font-semibold">{formatMoney(amount, settings.currency)}</span> every{" "}
              {settings.distributionFrequencyMonths} months.
            </p>
          </div>
          <p className="text-xs text-muted">
            This demo uses a stub payment confirmation. No real charge is made. In production this step would hand
            off to a payment gateway (Phase 2).
          </p>
          <ConfirmSponsorshipButton childId={child.id} />
        </CardContent>
      </Card>
    </div>
  );
}
