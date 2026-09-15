import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

// The PC review flow's signature layout: whatever Ufuk submitted on the
// left, verification controls in their own panel on the right. Used by
// both the report and distribution-evidence review cards, which had
// duplicated this exact split before — one component now, one place to
// keep the two visually distinct halves consistent.
export function ReviewPanel({ submission, verification }: { submission: ReactNode; verification: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid sm:grid-cols-[1fr_320px]">
        <div className="p-5">{submission}</div>
        <div className="border-t sm:border-t-0 sm:border-l border-border bg-brand-light/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark mb-3">Verification</p>
          {verification}
        </div>
      </div>
    </Card>
  );
}
