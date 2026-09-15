import Link from "next/link";
import { cn } from "@/lib/cn";

export function ReviewTabs({ active, counts }: { active: string; counts: Record<string, number> }) {
  const tabs = [
    { key: "reports", label: "Child Reports" },
    { key: "distributions", label: "Distribution Evidence" },
    { key: "media", label: "Media" },
    { key: "messages", label: "Sponsor Messages" },
    { key: "sponsorships", label: "Sponsorship Requests" },
  ];

  return (
    <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/management/review?tab=${tab.key}`}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5",
            active === tab.key ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {tab.label}
          {!!counts[tab.key] && (
            <span className="rounded-full bg-accent-light text-accent-dark text-xs font-semibold px-1.5">
              {counts[tab.key]}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
