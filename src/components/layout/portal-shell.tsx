"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  const isActive = (href: string) => (href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

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
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={26} showWordmark={false} />
              <span className="text-sm font-semibold text-ink hidden sm:block">{portalLabel}</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href={notificationsHrefFor(pathname)} className="relative text-ink text-sm hover:text-accent" aria-label="Notifications">
              🔔
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
            <div className="w-64 bg-surface border-r border-border overflow-y-auto">{sidebar}</div>
            <div className="flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
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
