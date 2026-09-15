import { cn } from "@/lib/cn";

// The one recurring "✓ Verified by MyFundAction" mark — trust section,
// child profile trust indicators, dashboard update cards. The checkmark
// draws on with `.animate-check` once, on load/scroll-in; it never repeats
// or loops, so it reads as a deliberate confirmation, not decoration.
export function VerificationBadge({
  label = "Verified by MyFundAction",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-brand", className)}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="var(--color-brand)" />
        <path
          d="M4.5 8.2l2.2 2.2 4.8-4.8"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-check"
        />
      </svg>
      {label}
    </span>
  );
}
