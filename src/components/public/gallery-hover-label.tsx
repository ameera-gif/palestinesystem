"use client";

import { useEffect, useState } from "react";

/**
 * The brief's one optional cursor interaction: on desktop, a small label
 * follows the pointer over child gallery imagery. Deliberately scoped and
 * narrow — not a global custom cursor. `(hover: hover) and (pointer: fine)`
 * means touch devices never register the listeners at all (not just
 * hidden via CSS), so there's no dead weight on mobile.
 *
 * The capability check runs in an effect, not at first render: `window`
 * doesn't exist during SSR, so the very first client render must also
 * render nothing (matching the server) to avoid a hydration mismatch —
 * the same pattern MobileNav uses for its portal-only panel.
 */
export function GalleryHoverLabel({ label = "View Story" }: { label?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDesktopHover, setIsDesktopHover] = useState(false);

  useEffect(() => {
    setIsDesktopHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  if (!isDesktopHover) return null;

  return (
    <div
      className="absolute inset-0 z-10"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos(null)}
      aria-hidden="true"
    >
      {pos && (
        <span
          className="pointer-events-none absolute rounded-full bg-ink/85 px-3 py-1.5 text-xs font-medium text-white -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
          style={{ left: pos.x, top: pos.y }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
