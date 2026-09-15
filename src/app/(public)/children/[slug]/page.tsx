import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toPublicChildProfile } from "@/lib/mappers/child";
import { auth } from "@/auth";
import { getProgrammeSettings, quarterlyAmount } from "@/lib/settings";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/brand/section-heading";
import { formatMoney } from "@/lib/format";

const INCLUDES = [
  { title: "Quarterly Support", body: "Your monthly sponsorship is delivered as one consolidated support payment every cycle." },
  { title: "Progress Updates", body: "Regular reports on how they're doing: school, wellbeing, and daily life." },
  { title: "Verified Delivery", body: "Every distribution is documented on the ground and checked before it reaches you." },
  { title: "Meaningful Connection", body: "A facilitated meeting roughly every six months, subject to safety and operational conditions." },
];

const TRUST_INDICATORS = ["Delivery documented", "Updates verified", "Private sponsor portal"];

const TIMELINE = ["Today", "Month 3", "Progress Update", "Month 6", "Next Cycle"];

export default async function PublicChildProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = await prisma.child.findUnique({ where: { slug } });
  if (!record || record.status === "DRAFT" || record.status === "ELIGIBLE") notFound();

  const child = toPublicChildProfile(record);
  const [session, settings] = await Promise.all([auth(), getProgrammeSettings()]);
  const amount = quarterlyAmount(settings);
  const firstName = child.displayName.split(" ")[0];

  return (
    <div>
      {/* Hero — the second "unforgettable moment": the photo morphs in
          from wherever the visitor clicked (directory card, or the
          homepage's featured grid), via a shared ViewTransition name. */}
      <section className="bg-brand-light">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 grid sm:grid-cols-[minmax(0,360px)_1fr] gap-8 sm:gap-12 items-start">
          <div className="aspect-4/5 sm:aspect-square rounded-2xl overflow-hidden bg-white border border-border">
            {child.photoUrl && (
              <ViewTransition name={`child-photo-${child.slug}`} share="morph" default="none">
                {/* eslint-disable-next-line @next/next/no-img-element -- local generated SVG placeholder, optimization not needed */}
                <img src={child.photoUrl} alt="" className="h-full w-full object-cover" />
              </ViewTransition>
            )}
          </div>
          <div>
            <StatusPill
              label={child.availableForSponsorship ? "Waiting for a sponsor" : "Sponsored"}
              tone={child.availableForSponsorship ? "accent" : "success"}
            />
            <h1 className="font-display mt-3 text-3xl sm:text-5xl font-semibold text-ink tracking-tight">{child.displayName}</h1>
            <p className="mt-1.5 text-muted">
              {child.age} years old · {child.gender === "MALE" ? "Boy" : "Girl"} · {child.region}
            </p>
            {child.bio && <p className="mt-4 text-ink max-w-lg">{child.bio}</p>}

            <p className="mt-5 text-sm text-ink">
              <span className="font-semibold">{formatMoney(settings.monthlySponsorshipAmount, settings.currency)}/month</span>, distributed
              as {formatMoney(amount, settings.currency)} every {settings.distributionFrequencyMonths} months.
            </p>

            <div id="sponsor" className="mt-6">
              {child.availableForSponsorship ? (
                <SponsorCta childId={child.id} firstName={firstName} isAuthenticated={!!session?.user} />
              ) : (
                <p className="text-sm text-muted">
                  {child.displayName} is currently sponsored. Browse other children waiting for a sponsor.
                </p>
              )}
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {TRUST_INDICATORS.map((label) => (
                <li key={label} className="flex items-center gap-1.5 text-sm text-brand-dark">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
                    <path d="M3.5 8.2l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {label}
                </li>
              ))}
            </ul>

            <Button href="/sponsor-a-child" variant="ghost" size="sm" className="mt-4 -ml-3">
              ← Back to all children
            </Button>
          </div>
        </div>
      </section>

      {/* What Sponsorship Includes */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          <SectionHeading title="What sponsorship includes" className="animate-on-scroll" />
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INCLUDES.map((item, i) => (
              <div key={item.title} className="animate-on-scroll rounded-xl border border-border p-5" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="font-display font-semibold text-ink">{item.title}</p>
                <p className="mt-1.5 text-sm text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship timeline — a quiet, subtle beat, not a scrollytelling
          moment: the line fills once as it enters view. */}
      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          <SectionHeading title="What happens after you sponsor" className="animate-on-scroll" />
          <div className="mt-10 relative">
            <div className="absolute left-0 right-0 top-[7px] h-px bg-border" aria-hidden="true" />
            <div className="timeline-fill-x absolute left-0 right-0 top-[7px] h-px bg-brand origin-left" aria-hidden="true" />
            <ol className="relative grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-6">
              {TIMELINE.map((label) => (
                <li key={label}>
                  <span className="block h-3.5 w-3.5 rounded-full bg-brand" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-ink">{label}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Interests / aspirations — short, human, not a case file. */}
      {(child.interests || child.aspirations) && (
        <section className="bg-surface">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-16">
            {child.interests && (
              <p className="text-ink">
                <span className="font-semibold">Enjoys:</span> {child.interests}
              </p>
            )}
            {child.aspirations && (
              <p className="mt-2 text-ink">
                <span className="font-semibold">Dreams of:</span> {child.aspirations}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function SponsorCta({ childId, firstName, isAuthenticated }: { childId: string; firstName: string; isAuthenticated: boolean }) {
  const href = isAuthenticated ? `/portal/sponsor/${childId}` : `/signup?childId=${childId}`;
  return (
    <div>
      <Button href={href} size="lg">
        Sponsor {firstName}
      </Button>
      {!isAuthenticated && <p className="mt-2 text-xs text-muted">You&rsquo;ll create a free sponsor account in the next step.</p>}
    </div>
  );
}
