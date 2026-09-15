import { AnimatedNumber } from "@/components/motion/animated-number";
import { cn } from "@/lib/cn";

// A single figure inside the editorial impact block — small and quiet by
// design. The section's emotional weight lives in its headline copy, not
// in a bank of oversized KPI cards; these numbers are supporting detail.
export function ImpactStat({
  value,
  suffix = "",
  label,
  tone = "ink",
}: {
  value: number;
  suffix?: string;
  label: string;
  tone?: "ink" | "white";
}) {
  return (
    <div>
      <p className={cn("text-3xl sm:text-4xl font-display font-semibold tabular-nums", tone === "white" ? "text-white" : "text-brand")}>
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className={cn("mt-1 text-sm", tone === "white" ? "text-white/65" : "text-muted")}>{label}</p>
    </div>
  );
}
