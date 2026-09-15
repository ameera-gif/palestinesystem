import { prisma } from "@/lib/prisma";
import { toPublicChildCard } from "@/lib/mappers/child";
import { Button } from "@/components/ui/button";
import { ChildCard } from "@/components/public/child-card";
import { JourneyOfSupport } from "@/components/public/journey-of-support";
import { SectionHeading } from "@/components/brand/section-heading";
import { VerificationBadge } from "@/components/brand/verification-badge";
import { ImpactStat } from "@/components/brand/impact-stat";
import { LogoMark } from "@/components/brand/logo-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { FAQS } from "@/lib/faq-data";
import { getDictionaryForRequest } from "@/lib/i18n";

export default async function HomePage() {
  const { dict } = await getDictionaryForRequest();

  const [featuredChildren, sponsoredCount, availableCount, totalCount] = await Promise.all([
    prisma.child.findMany({ where: { status: "AVAILABLE" }, take: 3, orderBy: { registeredAt: "desc" } }),
    prisma.child.count({ where: { status: "SPONSORED" } }),
    prisma.child.count({ where: { status: "AVAILABLE" } }),
    prisma.child.count(),
  ]);

  return (
    <>
      {/* 1. Cinematic hero — the first of the three "unforgettable moments".
          Large editorial type, staged fade-in, dark green ground. No stock
          imagery, no decorative blob field (explicitly out of scope for
          this redesign) — the type carries the moment on its own. */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand to-brand-dark">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.06), transparent)" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-20 -top-20 opacity-[0.10] animate-spin-slow">
          <LogoMark size={440} monochrome="#D9CBB6" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <p className="animate-fade-up text-sm font-semibold text-sand uppercase tracking-wide">{dict.home.heroEyebrow}</p>

          <h1 className="mt-5 font-display text-5xl sm:text-7xl font-semibold text-white leading-[1.02] tracking-tight">
            <span className="block animate-enter">{dict.home.heroLine1}</span>
            <span className="block animate-enter" style={{ animationDelay: "110ms" }}>
              {dict.home.heroLine2}
            </span>
            <span className="block animate-enter" style={{ animationDelay: "220ms" }}>
              {dict.home.heroLine3}
            </span>
          </h1>

          <p className="animate-fade-up mt-7 text-base sm:text-lg text-white/70 max-w-xl mx-auto" style={{ animationDelay: "320ms" }}>
            {dict.home.heroSubtitle}
          </p>

          <div className="animate-fade-up mt-9 flex flex-wrap gap-3 justify-center" style={{ animationDelay: "380ms" }}>
            <Button href="/sponsor-a-child" size="lg">
              {dict.home.heroCtaPrimary}
            </Button>
            <Button href="/how-it-works" variant="outline" size="lg" className="bg-white/5 border-white/25 text-white hover:bg-white/10">
              {dict.home.heroCtaSecondary}
            </Button>
          </div>

          <p className="animate-fade-up mt-8 text-xs text-white/50" style={{ animationDelay: "440ms" }}>
            {dict.home.heroTrustMicrocopy}
          </p>
        </div>
      </section>

      {/* 2. Short human story — an editorial layout, not another centered
          eyebrow-heading-subtext stack: a narrow kicker column beside a
          wider text column, like a magazine standfirst. */}
      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 md:gap-16 items-start">
            <p className="animate-on-scroll text-xs font-semibold uppercase tracking-wide text-muted">{dict.home.storyEyebrow}</p>
            <div className="animate-on-scroll">
              <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.15] text-ink">{dict.home.storyTitle}</h2>
              <p className="mt-6 text-base sm:text-lg text-muted max-w-xl">{dict.home.storyBody}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Journey of Support — sticky-scroll signature section. Same
          kicker-column device as the story section above, so the two
          reads as a deliberate rhythm rather than each section reaching
          for its own eyebrow-pill treatment. */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 md:gap-16 items-start mb-12 sm:mb-16">
            <p className="animate-on-scroll text-xs font-semibold uppercase tracking-wide text-muted">{dict.home.journeyEyebrow}</p>
            <div className="animate-on-scroll">
              <h2 className="font-display text-2xl sm:text-4xl font-semibold text-ink tracking-tight">{dict.home.journeyTitle}</h2>
              <p className="mt-3 text-muted max-w-lg">{dict.home.journeySubtitle}</p>
            </div>
          </div>
          <JourneyOfSupport />
        </div>
      </section>

      {/* 4. Meet the Children */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="animate-on-scroll flex items-end justify-between gap-4 flex-wrap">
            <SectionHeading title={dict.home.meetTitle} subtitle={dict.home.meetSubtitle} />
            <Button href="/sponsor-a-child" variant="outline">
              View all children
            </Button>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredChildren.map((child, i) => (
              <div key={child.id} className="animate-on-scroll" style={{ animationDelay: `${i * 70}ms` }}>
                <ChildCard child={toPublicChildCard(child)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trust & Verification — the section that carries the brief's
          signature editorial headline. Dark ground, high contrast, the
          verification sequence rendered as a simple left-to-right chain. */}
      <section className="relative overflow-hidden bg-brand-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <SectionHeading
            eyebrow={dict.home.trustEyebrow}
            title={
              <>
                Trust shouldn&rsquo;t
                <br />
                be something
                <br />
                you have to
                <br />
                guess.
              </>
            }
            editorial
            tone="white"
            className="animate-on-scroll"
          />

          <div className="mt-16 flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-4 border-t border-white/10 pt-10">
            {[
              { step: "Our partner submits", detail: "A field report with photos and delivery evidence." },
              { step: "MyFundAction reviews", detail: "Checked against safeguarding and verification standards." },
              { step: "You see the update", detail: "Published to your dashboard once verified." },
            ].map((s, i, arr) => (
              <div key={s.step} className="animate-on-scroll flex-1 flex items-start gap-4" style={{ animationDelay: `${i * 90}ms` }}>
                <div>
                  <p className="font-medium text-white">{s.step}</p>
                  <p className="mt-1 text-sm text-white/55">{s.detail}</p>
                </div>
                {i < arr.length - 1 && <span className="hidden sm:block text-white/20 text-2xl leading-none shrink-0">/</span>}
              </div>
            ))}
          </div>

          <div className="animate-on-scroll mt-10">
            <VerificationBadge label="Verified by MyFundAction" className="text-white" />
          </div>
        </div>
      </section>

      {/* 6. Impact, told as a plain statement first, figures second — no
          eyebrow tag here, it stands on its own. */}
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-28 text-center">
          <p className="animate-on-scroll font-editorial text-3xl sm:text-5xl leading-[1.2] text-ink max-w-2xl mx-auto">
            {dict.home.impactLede}
          </p>
          <div className="animate-on-scroll mt-14 flex flex-wrap justify-center gap-x-14 gap-y-8">
            <ImpactStat value={sponsoredCount} label="Sponsored" />
            <ImpactStat value={availableCount} label="Waiting" />
            <ImpactStat value={totalCount ? 100 : 0} suffix="%" label="Reports reviewed" />
          </div>
        </div>
      </section>

      {/* 7. Sponsor dashboard preview — illustrative chrome only, not a
          real sponsor's data, so it can't be mistaken for an actual
          account. */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
          <SectionHeading
            title={dict.home.dashboardPreviewTitle}
            subtitle={dict.home.dashboardPreviewSubtitle}
            align="center"
            className="animate-on-scroll mx-auto"
          />
          <div className="animate-on-scroll mt-12 rounded-2xl border border-border bg-paper p-4 sm:p-8">
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Welcome back</p>
                  <p className="font-display text-lg font-semibold text-ink">Here&rsquo;s how they&rsquo;ve been doing</p>
                </div>
                <StatusPill label="Sponsorship Active" tone="success" />
              </div>
              <div className="mt-6 grid sm:grid-cols-[160px_1fr] gap-6 items-start">
                <div className="aspect-square rounded-xl bg-brand-light" aria-hidden="true" />
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Latest update</p>
                    <p className="mt-1 text-sm text-ink">A new progress report was verified and published to your dashboard.</p>
                    <VerificationBadge className="mt-2" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg border border-border p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Next support</p>
                      <p className="mt-1 text-sm text-ink">In 18 days</p>
                    </div>
                    <div className="flex-1 rounded-lg border border-border p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Our Journey</p>
                      <p className="mt-1 text-sm text-ink">5 milestones so far</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ preview — a left-heading, right-accordion split rather than
          centered above, its own distinct ratio from the story/journey
          kicker device above. */}
      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="grid md:grid-cols-[1fr_1.6fr] gap-6 md:gap-16">
            <h2 className="animate-on-scroll font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              {dict.home.faqTitle}
            </h2>
            <div className="animate-on-scroll">
              <div className="divide-y divide-border border-t border-b border-border">
                {FAQS.slice(0, 4).map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between font-medium text-ink">
                      {f.q}
                      <span className="text-muted group-open:rotate-45 transition-transform shrink-0 ml-4">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
              <div className="mt-6">
                <Button href="/faq" variant="outline">
                  See all questions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand to-brand-dark">
        <div className="animate-on-scroll relative mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight">{dict.home.finalCtaTitle}</h2>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">{dict.home.finalCtaSubtitle}</p>
          <Button href="/sponsor-a-child" variant="primary" size="lg" className="mt-7">
            {dict.home.finalCtaButton}
          </Button>
        </div>
      </section>
    </>
  );
}
