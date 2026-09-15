import { formatDate } from "@/lib/format";
import type { JourneyEvent } from "@/lib/services/journey";

// The dashboard's signature moment: every verified thing that has happened
// in this sponsorship, in one thread. Built on plain <details> so every
// event expands with no JS and stays keyboard/screen-reader accessible —
// the "shared-element expansion" the brief describes is approximated here
// with a simple, honest disclosure instead of a heavier animated modal,
// which would risk hiding the detail behind motion that some sponsors
// (reduced-motion, screen readers, slow connections) would never see.
const ICONS: Record<JourneyEvent["icon"], React.ReactNode> = {
  heart: (
    <path d="M8 13.5S2.5 10 2.5 6.3A2.8 2.8 0 018 4.6 2.8 2.8 0 0113.5 6.3c0 3.7-5.5 7.2-5.5 7.2z" />
  ),
  check: <path d="M3 8.5l3 3 7-7" />,
  report: <path d="M4 2.5h6l2.5 2.5V13.5h-8.5V2.5z M10 2.5V5h2.5 M5.5 8h5 M5.5 10.5h5" />,
  media: <path d="M2.5 5h2l1-1.5h5l1 1.5h2v7.5h-11V5z M8 6.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />,
  meeting: <path d="M2.5 4.5h8v6h-8z M10.5 6.5l3-1.5v6l-3-1.5" />,
};

export function JourneyTimeline({ events, title = "Our Journey" }: { events: JourneyEvent[]; title?: string }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">Once your sponsorship begins, every milestone will appear here.</p>;
  }

  return (
    <div>
      {title && <h2 className="font-display text-lg font-semibold text-ink mb-5">{title}</h2>}
      <ol className="relative pl-9">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
        {events.map((event, i) => (
          <li key={event.id} className="animate-on-scroll relative pb-7 last:pb-0" style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>
            <span className="absolute -left-9 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-brand">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[event.icon]}
              </svg>
            </span>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <p className="text-xs text-muted">{formatDate(event.date)}</p>
                <p className="mt-0.5 font-medium text-ink flex items-center gap-1.5">
                  {event.title}
                  {event.detail && (
                    <span className="text-muted text-xs transition-transform group-open:rotate-90" aria-hidden="true">
                      ›
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-muted line-clamp-2 group-open:line-clamp-none">{event.summary}</p>
              </summary>
              {event.detail && <p className="mt-2 text-sm text-ink bg-paper rounded-lg p-3">{event.detail}</p>}
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
