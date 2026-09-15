import { prisma } from "@/lib/prisma";
import { toPublicChildCard } from "@/lib/mappers/child";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChildCard } from "@/components/public/child-card";
import { LogoMark } from "@/components/brand/logo-mark";
import { WaveMotif } from "@/components/brand/wave-motif";
import { BlobBackground } from "@/components/brand/blob-background";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { getDictionaryForRequest } from "@/lib/i18n";

const TRUST_BADGES = [
  {
    label: "Every report verified",
    icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    tone: "gold",
  },
  {
    label: "Safeguarding-first",
    icon: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
    tone: "blue",
  },
  {
    label: "Transparent support delivery",
    icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    tone: "gold",
  },
  {
    label: "MyFundAction-managed",
    icon: <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />,
    tone: "blue",
  },
];

// Each party in the model gets its own colour identity across the three
// cards below — gold for the sponsor, charcoal for MyFundAction, blue for
// Ufuk — instead of one repeated accent bar.
const TRUST_CARDS = [
  { label: "You", detail: "You sponsor a child and receive verified updates.", border: "border-t-accent", badge: "bg-accent" },
  {
    label: "MyFundAction",
    detail: "We manage the programme, review every submission, and verify what's shown to you.",
    border: "border-t-brand",
    badge: "bg-brand",
  },
  {
    label: "Ufuk",
    detail: "Our implementing partner in Gaza — registers children, delivers support, prepares reports.",
    border: "border-t-blue",
    badge: "bg-blue",
  },
];

export default async function HomePage() {
  const { dict } = await getDictionaryForRequest();

  const [featuredChildren, sponsoredCount, availableCount] = await Promise.all([
    prisma.child.findMany({ where: { status: "AVAILABLE" }, take: 3, orderBy: { registeredAt: "desc" } }),
    prisma.child.count({ where: { status: "SPONSORED" } }),
    prisma.child.count({ where: { status: "AVAILABLE" } }),
  ]);

  // Short labels only — the full walkthrough (with pricing specifics and the
  // meeting policy) lives on /how-it-works so this stays a quick preview,
  // not a duplicate of that page's content.
  const stepPreview = ["You sponsor", "Ufuk delivers", "MyFundAction verifies", "You're updated"];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand to-brand-dark">
        <BlobBackground variant="dark" />

        {/* Decorative brand mark — large, faded, off-canvas, slowly
            rotating. Purely atmospheric; never competes with foreground
            text for attention. */}
        <div className="pointer-events-none absolute -right-24 -top-24 opacity-[0.12] sm:opacity-[0.16] animate-spin-slow">
          <LogoMark size={480} monochrome="#F2941F" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <p className="text-sm font-semibold text-accent-bright uppercase tracking-wide">
              {dict.home.heroEyebrow}
            </p>
            <h1 className="font-display mt-3 text-4xl sm:text-6xl font-semibold text-white leading-[1.05] tracking-tight">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/75 max-w-xl">{dict.home.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/sponsor-a-child" size="lg">
                {dict.home.heroCta}
              </Button>
              <Button href="/how-it-works" variant="outline" size="lg" className="bg-white/5 border-white/25 text-white hover:bg-white/10">
                {dict.home.heroCtaSecondary}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Card
              className="animate-fade-up col-span-3 sm:col-span-1 p-5 flex flex-col justify-center border-white/10 bg-white/95 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: "80ms" }}
            >
              <p className="text-3xl font-semibold text-accent-dark tabular-nums">
                <AnimatedNumber value={sponsoredCount} />
              </p>
              <p className="text-sm text-muted mt-1">Children currently sponsored</p>
            </Card>
            <Card
              className="animate-fade-up col-span-3 sm:col-span-1 p-5 flex flex-col justify-center border-white/10 bg-white/95 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: "160ms" }}
            >
              <p className="text-3xl font-semibold text-blue-dark tabular-nums">
                <AnimatedNumber value={availableCount} />
              </p>
              <p className="text-sm text-muted mt-1">Waiting for a sponsor</p>
            </Card>
            <Card
              className="animate-fade-up col-span-3 sm:col-span-1 p-5 flex flex-col justify-center border-white/10 bg-white/95 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: "240ms" }}
            >
              <p className="text-3xl font-semibold text-accent-dark tabular-nums">
                <AnimatedNumber value={100} suffix="%" />
              </p>
              <p className="text-sm text-muted mt-1">Reports verified before publishing</p>
            </Card>
          </div>
        </div>

        {/* Trust badges strip */}
        <div className="relative border-t border-white/10 bg-black/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-wrap gap-x-8 gap-y-3 justify-center sm:justify-between">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-white/85 text-xs sm:text-sm font-medium">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 ${b.tone === "blue" ? "text-[#5FA8D3]" : "text-accent-bright"}`}
                >
                  {b.icon}
                </svg>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / relationship explainer — pale blue tint breaks up the
          cream/charcoal-only rhythm the rest of the page uses. */}
      <section className="relative overflow-hidden bg-blue-light">
        <div className="pointer-events-none absolute -right-6 top-10 opacity-40 hidden md:block">
          <WaveMotif size={220} color="#1D6FA5" animated />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-ink tracking-tight">{dict.home.trustTitle}</h2>
            <p className="mt-2 text-muted">{dict.home.trustSubtitle}</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {TRUST_CARDS.map((p, i) => (
              <Card
                key={p.label}
                className={`animate-fade-up p-6 relative border-t-4 ${p.border} h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${p.badge} text-white text-sm font-semibold`}>
                  {i + 1}
                </span>
                <p className="mt-4 font-semibold text-ink">{p.label}</p>
                <p className="mt-1.5 text-sm text-muted">{p.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — a quick preview only; the full walkthrough (with
          pricing and the meeting policy) lives on /how-it-works. */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-ink tracking-tight">{dict.home.howTitle}</h2>
            <Button href="/how-it-works" variant="outline">
              See the full walkthrough
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-4">
            {stepPreview.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-full border border-border bg-paper px-4 py-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${
                      i % 2 === 0 ? "bg-accent" : "bg-blue"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-ink whitespace-nowrap">{label}</span>
                </div>
                {i < stepPreview.length - 1 && (
                  <span className="text-muted" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured children */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-ink tracking-tight">Children waiting for a sponsor</h2>
            <p className="mt-2 text-muted">Every profile below has been reviewed and approved by MyFundAction.</p>
          </div>
          <Button href="/sponsor-a-child" variant="outline">
            View all children
          </Button>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredChildren.map((child, i) => (
            <div key={child.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <ChildCard child={toPublicChildCard(child)} />
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand to-brand-dark">
        <BlobBackground variant="dark" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 opacity-[0.14] animate-spin-slow">
          <LogoMark size={280} monochrome="#F2941F" />
        </div>
        <div className="pointer-events-none absolute right-8 top-8 opacity-25 hidden sm:block">
          <WaveMotif size={180} color="#5FA8D3" animated />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-2xl sm:text-4xl font-semibold text-white tracking-tight">Ready to sponsor a child in Gaza?</h2>
          <p className="mt-3 text-white/75 max-w-xl mx-auto">
            Every sponsorship is verified, reported on, and reviewed — so your support reaches the child it's meant for.
          </p>
          <Button href="/sponsor-a-child" variant="primary" size="lg" className="mt-6">
            {dict.home.heroCta}
          </Button>
        </div>
      </section>
    </>
  );
}
