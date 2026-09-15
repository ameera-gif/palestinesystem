"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

export function MobileNav({
  navItems,
  loginHref,
  loginLabel,
  sponsorLabel,
}: {
  navItems: NavItem[];
  loginHref: string;
  loginLabel: string;
  sponsorLabel: string;
}) {
  const [open, setOpen] = useState(false);
  // Portals need `document`, which doesn't exist during SSR — only render
  // the panel once mounted on the client. Also: any ancestor with `filter`
  // / `backdrop-filter` / `transform` creates a new containing block for
  // `position: fixed` descendants (the header's blurred bar does exactly
  // this), which traps a same-tree fixed panel instead of covering the
  // viewport. Portaling straight to document.body sidesteps that entirely,
  // regardless of what the trigger button happens to be nested inside.
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink hover:bg-black/5 transition-colors"
      >
        <span
          className={`absolute block h-0.5 w-5 bg-current transition-all duration-200 ${open ? "rotate-45" : "-translate-y-1.5"}`}
        />
        <span className={`absolute block h-0.5 w-5 bg-current transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
        <span
          className={`absolute block h-0.5 w-5 bg-current transition-all duration-200 ${open ? "-rotate-45" : "translate-y-1.5"}`}
        />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30 animate-fade-up" onClick={() => setOpen(false)} />
            <div className="animate-enter absolute inset-x-0 top-16 bottom-0 bg-paper overflow-y-auto shadow-xl">
              <nav className="flex flex-col px-4 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-3.5 text-base font-medium text-ink border-b border-border hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-3">
                  <Button href="/sponsor-a-child" size="lg" className="w-full">
                    {sponsorLabel}
                  </Button>
                  <Button href={loginHref} variant="outline" size="lg" className="w-full">
                    {loginLabel}
                  </Button>
                </div>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
