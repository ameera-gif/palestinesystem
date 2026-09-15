"use client";

import { useEffect, useState } from "react";

/**
 * Counts up to `value` on mount. Deliberately safe by construction, unlike
 * the scroll-reveal approach removed earlier: the initial render (both SSR
 * and the client's first paint, before any effect runs) shows the real
 * final value — never 0, never blank — so a crawler, a no-JS browser, or a
 * screenshot taken before hydration all see the correct number immediately.
 * Only after mount does it briefly reset and animate up, as a visual
 * flourish layered on top of content that was already correct.
 *
 * No "has it already run" ref guard here on purpose: React 18/19 Strict
 * Mode deliberately double-invokes effects in development (mount → cleanup
 * → mount again) specifically to catch effects that aren't safely
 * re-runnable. A `hasRun` guard defeats that check rather than passing it —
 * it silently no-ops the second, real invocation, leaving the animation
 * permanently stuck at 0. Making the effect itself idempotent (every run
 * restarts cleanly and the cleanup cancels any in-flight frame) is the
 * actual fix, not suppressing the re-run.
 */
export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || value === 0) {
      setDisplay(value);
      return;
    }

    setDisplay(0);
    const duration = 900;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}
