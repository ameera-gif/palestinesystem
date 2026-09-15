import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toPublicChildProfile } from "@/lib/mappers/child";
import { auth } from "@/auth";
import { getProgrammeSettings, quarterlyAmount } from "@/lib/settings";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export default async function PublicChildProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = await prisma.child.findUnique({ where: { slug } });
  if (!record || record.status === "DRAFT" || record.status === "ELIGIBLE") notFound();

  const child = toPublicChildProfile(record);
  const [session, settings] = await Promise.all([auth(), getProgrammeSettings()]);
  const amount = quarterlyAmount(settings);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-light">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 grid sm:grid-cols-[240px_1fr] gap-8 items-start">
          <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-border">
            {child.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={child.photoUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <StatusPill
              label={child.availableForSponsorship ? "Available for Sponsorship" : "Sponsored"}
              tone={child.availableForSponsorship ? "accent" : "success"}
            />
            <h1 className="font-display mt-3 text-3xl sm:text-5xl font-semibold text-ink tracking-tight">{child.displayName}</h1>
            <p className="mt-1.5 text-muted">
              {child.age} years old · {child.gender === "MALE" ? "Boy" : "Girl"} · {child.region}
            </p>
            {child.bio && <p className="mt-4 text-ink max-w-xl">{child.bio}</p>}
            <div id="sponsor" className="mt-6">
              {child.availableForSponsorship ? (
                <SponsorCta childId={child.id} isAuthenticated={!!session?.user} amount={amount} currency={settings.currency} />
              ) : (
                <p className="text-sm text-muted">
                  {child.displayName} is currently sponsored. Browse other children waiting for a sponsor.
                </p>
              )}
              <div className="mt-3">
                <Button href="/sponsor-a-child" variant="outline" size="sm">
                  ← Back to all children
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink">{child.educationStage ?? "School-age child, enrolled locally."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interests &amp; Aspirations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {child.interests && (
                <p className="text-sm text-ink">
                  <span className="font-medium">Enjoys:</span> {child.interests}
                </p>
              )}
              {child.aspirations && (
                <p className="text-sm text-ink">
                  <span className="font-medium">Dreams of:</span> {child.aspirations}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How Updates Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-ink">
              <p>
                Once you sponsor {child.displayName}, our field partner Ufuk will prepare regular progress reports
                and support delivery confirmations. MyFundAction reviews and verifies every one of these before it
                reaches you in your sponsor portal.
              </p>
              <p>Operational reports are never shown publicly — only approved summaries reach your private sponsor dashboard.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Sponsorship Programme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-ink">
              <p>
                Sponsorship is {formatMoney(settings.monthlySponsorshipAmount, settings.currency)} per month, delivered
                as {formatMoney(amount, settings.currency)} every {settings.distributionFrequencyMonths} months.
              </p>
              <p>Your support is delivered and documented by Ufuk, and verified by MyFundAction before you're notified.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How MyFundAction Verifies Support</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink space-y-2">
              <p>Every distribution is documented by Ufuk with evidence, then reviewed and verified by our team before you receive a Support Update.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SponsorCta({
  childId,
  isAuthenticated,
  amount,
  currency,
}: {
  childId: string;
  isAuthenticated: boolean;
  amount: number;
  currency: string;
}) {
  const href = isAuthenticated ? `/portal/sponsor/${childId}` : `/signup?childId=${childId}`;
  return (
    <div>
      <Button href={href} size="lg">
        Sponsor This Child — {formatMoney(amount, currency)}/quarter
      </Button>
      {!isAuthenticated && (
        <p className="mt-2 text-xs text-muted">You'll create a free sponsor account in the next step.</p>
      )}
    </div>
  );
}
