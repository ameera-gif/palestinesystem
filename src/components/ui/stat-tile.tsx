import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * A KPI tile that is also a queue entry point — clicking "3" should take you
 * to the filtered list of those 3 things, per the PC/Ufuk dashboard brief
 * ("What is overdue?" should be one click from the number, not a chart). The
 * left accent bar carries the tone so an overdue tile is visually findable
 * at a glance across a busy dashboard, without resorting to icons or charts.
 */
export function StatTile({
  label,
  value,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  href?: string;
  tone?: "neutral" | "warning" | "danger";
}) {
  const toneClasses =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
        ? "text-warning"
        : "text-ink";

  const barClasses =
    tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-border";

  const content = (
    <>
      <span className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", barClasses)} />
      <p className={cn("text-3xl font-semibold tabular-nums", toneClasses)}>{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </>
  );

  const classes = "relative overflow-hidden rounded-xl border border-border bg-surface pl-6 pr-5 py-4 block";

  if (href) {
    return (
      <Link href={href} className={cn(classes, "hover:border-accent hover:shadow-sm transition-all")}>
        {content}
      </Link>
    );
  }
  return <div className={classes}>{content}</div>;
}
