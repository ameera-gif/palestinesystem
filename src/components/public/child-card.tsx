import { ViewTransition } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/ui/status-pill";
import { GalleryHoverLabel } from "@/components/public/gallery-hover-label";
import type { PublicChildCard } from "@/lib/mappers/child";

// Deliberately short: a photo, one status dot, name/age/location, one or
// two interests, one personal detail, one CTA. No bio excerpt — a long
// paragraph on a grid card reads like a case file, not a person. The full
// story lives on the profile page, which this card morphs into (shared
// `name` on the <ViewTransition>, matched in children/[slug]/page.tsx) —
// one of the redesign's three "unforgettable" moments.
export function ChildCard({ child }: { child: PublicChildCard }) {
  const interests = child.interests
    ?.split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Link
      href={`/children/${child.slug}`}
      className="group block rounded-xl border border-border bg-surface overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-brand/20"
    >
      <div className="aspect-4/3 bg-brand-light relative overflow-hidden">
        {child.photoUrl && (
          <ViewTransition name={`child-photo-${child.slug}`} share="morph" default="none">
            {/* eslint-disable-next-line @next/next/no-img-element -- local generated SVG placeholder, optimization not needed */}
            <img
              src={child.photoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </ViewTransition>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${child.availableForSponsorship ? "bg-accent" : "bg-success"}`}
            aria-hidden="true"
          />
          <StatusPill
            label={child.availableForSponsorship ? "Waiting for a sponsor" : "Sponsored"}
            tone={child.availableForSponsorship ? "accent" : "success"}
          />
        </div>
        <GalleryHoverLabel />
      </div>

      <div className="p-5 transition-transform duration-200 ease-out group-hover:-translate-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display font-semibold text-ink">
            {child.displayName}, {child.age}
          </h3>
        </div>
        <p className="text-sm text-muted mt-0.5">{child.region}</p>
        {interests && interests.length > 0 && <p className="text-sm text-ink mt-2">{interests.join(" · ")}</p>}
        {child.aspirations && (
          <p className="text-sm text-muted mt-1 line-clamp-2">
            <span className="font-medium text-ink">Dream:</span> {child.aspirations}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-1.5 text-sm font-medium text-brand">
          View {child.displayName.split(" ")[0]}&rsquo;s story
          <span className="transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
