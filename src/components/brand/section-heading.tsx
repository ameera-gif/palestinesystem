import { cn } from "@/lib/cn";

// Shared heading block for every homepage/marketing section: a small
// uppercase eyebrow, a title (Manrope by default; pass `editorial` for the
// handful of large emotional statements that should use Instrument Serif
// instead — never both at once, and never serif for body copy per the
// redesign's typography direction), and an optional supporting line.
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  editorial = false,
  align = "left",
  tone = "ink",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  editorial?: boolean;
  align?: "left" | "center";
  tone?: "ink" | "white";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center mx-auto" : "text-left", className)}>
      {eyebrow && (
        <p
          className={cn(
            "text-xs sm:text-sm font-semibold uppercase tracking-wide",
            tone === "white" ? "text-sand" : "text-accent-dark",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "mt-2 tracking-tight",
          editorial
            ? "font-editorial text-4xl sm:text-6xl leading-[1.05] font-normal"
            : "font-display text-2xl sm:text-4xl font-semibold leading-[1.1]",
          tone === "white" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-3 max-w-xl text-base", align === "center" && "mx-auto", tone === "white" ? "text-white/70" : "text-muted")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
