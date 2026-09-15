import { cn } from "@/lib/cn";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "brand" | "accent";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
  brand: "bg-brand-light text-brand-dark",
  accent: "bg-accent-light text-accent-dark",
  neutral: "bg-black/5 text-muted",
};

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  );
}

// Central place mapping every workflow enum to a human label + tone, so a
// status never renders as a raw SCREAMING_SNAKE_CASE string anywhere in the UI.
const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  // Child
  DRAFT: { label: "Draft", tone: "neutral" },
  ELIGIBLE: { label: "Eligible", tone: "info" },
  AVAILABLE: { label: "Available for Sponsorship", tone: "accent" },
  SPONSORED: { label: "Sponsored", tone: "success" },
  ON_HOLD: { label: "On Hold", tone: "warning" },
  EXITED: { label: "Exited", tone: "neutral" },
  // Sponsorship
  PENDING: { label: "Pending", tone: "warning" },
  ACTIVE: { label: "Active", tone: "success" },
  PAUSED: { label: "Paused", tone: "warning" },
  PAYMENT_ISSUE: { label: "Payment Issue", tone: "danger" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  // Report (non-report-domain fallback only — see REPORT_STATUS_MAP below
  // for the terms actually shown on report statuses)
  SUBMITTED: { label: "Submitted", tone: "info" },
  UNDER_REVIEW: { label: "Under Review", tone: "info" },
  RETURNED: { label: "Returned for Correction", tone: "danger" },
  APPROVED: { label: "Approved", tone: "success" },
  PUBLISHED: { label: "Published", tone: "success" },
  // Distribution
  PLANNED: { label: "Planned", tone: "neutral" },
  DISTRIBUTED: { label: "Distributed", tone: "info" },
  EVIDENCE_SUBMITTED: { label: "Evidence Submitted", tone: "info" },
  VERIFIED: { label: "Verified", tone: "success" },
  ISSUE_FLAGGED: { label: "Issue Flagged", tone: "danger" },
  // Media
  REJECTED: { label: "Rejected", tone: "danger" },
  INTERNAL: { label: "Internal Only", tone: "neutral" },
  SPONSOR_ONLY: { label: "Sponsor Only", tone: "brand" },
  PUBLIC_APPROVED: { label: "Public Approved", tone: "success" },
  // Meetings
  NOT_DUE: { label: "Not Due Yet", tone: "neutral" },
  DUE: { label: "Due", tone: "warning" },
  AWAITING_UFUK: { label: "Awaiting Field Partner", tone: "warning" },
  COORDINATING: { label: "Coordinating", tone: "info" },
  SCHEDULED: { label: "Scheduled", tone: "brand" },
  // Messages
  DELIVERED: { label: "Delivered", tone: "success" },
  MORE_INFO_REQUESTED: { label: "More Info Requested", tone: "warning" },
};

// The redesign brief standardizes report-review status wording to exactly
// these six terms everywhere they appear. They can't just replace the
// entries above — "APPROVED" and "SUBMITTED" are also raw values of other
// enums (MediaApprovalStatus, Message status) rendered through the same
// <StatusBadge>, and "Verified"/"Published to Sponsor" would be the wrong
// word choice there. `domain="report"` opts a call site into this map
// instead, so the two vocabularies never collide.
const REPORT_STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  SUBMITTED: { label: "Submitted", tone: "info" },
  UNDER_REVIEW: { label: "Under Review", tone: "info" },
  RETURNED: { label: "Amendment Required", tone: "danger" },
  APPROVED: { label: "Verified", tone: "success" },
  PUBLISHED: { label: "Published to Sponsor", tone: "success" },
};

export function StatusBadge({ status, domain }: { status: string; domain?: "report" }) {
  const map = domain === "report" ? REPORT_STATUS_MAP : STATUS_MAP;
  const entry = map[status] ?? STATUS_MAP[status] ?? { label: status, tone: "neutral" as Tone };
  return <StatusPill label={entry.label} tone={entry.tone} />;
}
