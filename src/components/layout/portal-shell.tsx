"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/actions/sign-out";

export type PortalNavItem = { href: string; label: string; badge?: number };

export function PortalShell({
  portalLabel,
  navItems,
  userName,
  unreadCount,
  children,
}: {
  portalLabel: string;
  navItems: PortalNavItem[];
  userName: string;
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The Dashboard item's href (e.g. "/portal") is itself a URL prefix of
  // every other item in the same sidebar ("/portal/meetings", etc.), so a
  // plain per-item `startsWith` check marks Dashboard active on every
  // page, alongside whichever page is actually open. Instead, find the
  // single best-matching item across the whole list first (exact match,
  // or otherwise the longest href that's a real path-segment match) and
  // only highlight that one.
  const activeHref = navItems.reduce<string | null>((best, item) => {
    const matches = item.href === "/" ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
    if (!matches) return best;
    return best === null || item.href.length > best.length ? item.href : best;
  }, null);
  const isActive = (href: string) => href === activeHref;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const sidebar = (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-brand text-white"
              : "text-ink hover:bg-brand-light",
          )}
        >
          <span>{item.label}</span>
          {!!item.badge && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                isActive(item.href) ? "bg-white/20 text-white" : "bg-accent-light text-accent-dark",
              )}
            >
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden rounded-md p-1.5 hover:bg-black/5"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={26} showWordmark={false} />
              <span className="text-sm font-semibold text-ink hidden sm:block">{portalLabel}</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href={notificationsHrefFor(pathname)} className="relative text-ink hover:text-accent" aria-label="Notifications">
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 8a5 5 0 0110 0c0 4 1.5 5 1.5 5h-13S5 12 5 8z" />
                <path d="M8.2 15.5a1.8 1.8 0 003.6 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <span className="text-sm text-ink hidden sm:block">{userName}</span>
            <form action={signOutAction}>
              <button type="submit" className="text-sm text-muted hover:text-danger">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-surface">
          {sidebar}
        </aside>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="animate-enter w-64 bg-surface border-r border-border overflow-y-auto">{sidebar}</div>
            <div className="animate-fade-up flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
          </div>
        )}
        <main className="flex-1 min-w-0 p-4 sm:p-6 bg-paper">{children}</main>
      </div>
    </div>
  );
}

function notificationsHrefFor(pathname: string) {
  if (pathname.startsWith("/implementer")) return "/implementer/notifications";
  if (pathname.startsWith("/management")) return "/management/notifications";
  if (pathname.startsWith("/admin")) return "/admin/notifications";
  return "/portal/notifications";
}
