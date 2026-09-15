"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function ChildTabs({ childId, base = "/portal/children" }: { childId: string; base?: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `${base}/${childId}`, label: "Profile" },
    { href: `${base}/${childId}/reports`, label: "Reports" },
    { href: `${base}/${childId}/support`, label: "Support Updates" },
    { href: `${base}/${childId}/media`, label: "Photos & Videos" },
  ];

  return (
    <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
              active ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
