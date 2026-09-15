import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import type { PublicChildCard } from "@/lib/mappers/child";

export function ChildCard({ child }: { child: PublicChildCard }) {
  return (
    <Card className="overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/children/${child.slug}`} className="block overflow-hidden">
        <div className="aspect-4/3 bg-brand-light relative">
          {child.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- local generated SVG placeholder, optimization not needed
            <img
              src={child.photoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
          <div className="absolute top-3 left-3">
            <StatusPill
              label={child.availableForSponsorship ? "Available for Sponsorship" : "Sponsored"}
              tone={child.availableForSponsorship ? "accent" : "success"}
            />
          </div>
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-ink">{child.displayName}</h3>
          <span className="text-sm text-muted">{child.age} yrs</span>
        </div>
        <p className="text-sm text-muted mt-0.5">{child.region} · {child.educationStage ?? "School age"}</p>
        {child.bio && <p className="text-sm text-ink mt-3 line-clamp-3">{child.bio}</p>}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
          <Button href={`/children/${child.slug}`} variant="outline" size="sm">
            View Profile
          </Button>
          {child.availableForSponsorship && (
            <Button href={`/children/${child.slug}#sponsor`} size="sm">
              Sponsor
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
