import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type { UfukTask } from "@/lib/services/ufuk-dashboard";

// The operational heart of the Ufuk dashboard: one row per outstanding
// task, each with a single direct CTA to where it's actually finished —
// no digging through Reports / Distributions submenus first.
export function TaskList({ tasks }: { tasks: UfukTask[] }) {
  if (tasks.length === 0) {
    return <EmptyState title="You're all caught up" description="No outstanding reports, amendments, or evidence uploads right now." />;
  }

  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div className="flex items-start gap-3">
            <span
              className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", task.urgency === "high" ? "bg-danger" : "bg-warning")}
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-ink">{task.title}</p>
              <p className="text-sm text-muted mt-0.5">{task.detail}</p>
            </div>
          </div>
          <Button href={task.href} size="sm" variant={task.urgency === "high" ? "primary" : "outline"}>
            {task.cta}
          </Button>
        </li>
      ))}
    </ul>
  );
}
