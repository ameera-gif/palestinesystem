const STAGES = [
  { n: "01", title: "You sponsor", body: "You choose a child and commit to monthly support. This is the start of an ongoing relationship, not a one-off donation." },
  { n: "02", title: "MyFundAction coordinates", body: "We schedule the distribution, brief our field partner, and log what's expected for this cycle." },
  { n: "03", title: "Our partner delivers", body: "Our implementing partner in Gaza distributes the support directly to the child's family on the ground." },
  { n: "04", title: "Delivery is documented", body: "Our partner records the distribution with photos and a short report. This is the evidence behind every update you receive." },
  { n: "05", title: "MyFundAction reviews", body: "Every submission is checked against our safeguarding and verification standards before it goes any further." },
  { n: "06", title: "You receive the update", body: "Once verified, it appears in your sponsor dashboard: the child's progress, confirmed and ready for you to see." },
] as const;

// The homepage's one true scrollytelling moment: a sticky progress rail
// (plain CSS `position: sticky`, no JS) that a visitor scrolls past while
// six stage cards reveal in turn. The rail's fill bar and node highlights
// are driven by a shared named view-timeline (see .journey-section in
// globals.css) — pure CSS, so it's inert-but-fully-readable wherever
// scroll-timelines aren't supported, and respects prefers-reduced-motion.
export function JourneyOfSupport() {
  return (
    <div className="journey-section grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-16">
      <div className="hidden lg:block">
        <div className="sticky top-28 self-start">
          <div className="relative pl-8">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" aria-hidden="true" />
            <div className="journey-fill absolute left-[7px] top-1 bottom-1 w-px bg-brand" aria-hidden="true" />
            <ul className="space-y-10">
              {STAGES.map((s) => (
                <li key={s.n} className="relative">
                  <span
                    data-stage={s.n.replace(/^0/, "")}
                    className="journey-node absolute -left-8 top-0.5 h-3.5 w-3.5 rounded-full bg-sand"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold text-ink">{s.title}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ol className="space-y-8 lg:space-y-14">
        {STAGES.map((s, i) => (
          <li key={s.n} className="animate-on-scroll" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-6 sm:p-8">
              <span className="font-display text-2xl sm:text-3xl font-semibold text-sand-dark shrink-0">{s.n}</span>
              <div>
                <p className="font-display text-lg sm:text-xl font-semibold text-ink">{s.title}</p>
                <p className="mt-1.5 text-sm sm:text-base text-muted">{s.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
