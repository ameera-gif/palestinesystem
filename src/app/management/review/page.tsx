import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewTabs } from "@/components/portal/review-tabs";
import { ReviewPanel } from "@/components/portal/review-panel";
import { periodLabel, formatDate, formatMoney } from "@/lib/format";
import {
  approveReportAction,
  returnReportAction,
  publishReportAction,
  verifyDistributionAction,
  flagDistributionAction,
  approveMediaAction,
  rejectMediaAction,
  moderateMessageAction,
  confirmSponsorshipAction,
} from "./actions";

export default async function ReviewCentrePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "reports" } = await searchParams;

  const [reportsPending, reportsApproved, distributions, media, messages, sponsorshipRequests] = await Promise.all([
    prisma.report.findMany({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }, include: { child: true, submittedByUfuk: true }, orderBy: { submittedAt: "asc" } }),
    prisma.report.findMany({ where: { status: "APPROVED" }, include: { child: true }, orderBy: { approvedAt: "asc" } }),
    prisma.distributionRecord.findMany({ where: { status: { in: ["EVIDENCE_SUBMITTED", "DISTRIBUTED"] } }, include: { child: true, batch: true, evidence: true }, orderBy: { updatedAt: "asc" } }),
    prisma.media.findMany({ where: { approvalStatus: "PENDING" }, include: { child: true, uploadedBy: true }, orderBy: { uploadedAt: "asc" } }),
    prisma.message.findMany({ where: { status: "SUBMITTED" }, include: { child: true, sponsor: true }, orderBy: { submittedAt: "asc" } }),
    prisma.sponsorship.findMany({ where: { status: "PENDING" }, include: { child: true, sponsor: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const counts = {
    reports: reportsPending.length + reportsApproved.length,
    distributions: distributions.length,
    media: media.length,
    messages: messages.length,
    sponsorships: sponsorshipRequests.length,
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">Review Centre</h1>
      <p className="text-sm text-muted mb-6">Everything our field partner has submitted, waiting for your review.</p>

      <ReviewTabs active={tab} counts={counts} />

      {tab === "reports" && (
        <div className="space-y-6">
          {reportsPending.length === 0 && reportsApproved.length === 0 ? (
            <EmptyState title="No reports waiting for review" />
          ) : (
            <>
              {reportsPending.map((r) => (
                <ReviewPanel
                  key={r.id}
                  submission={
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-ink">{r.child.displayName}</p>
                          <p className="text-xs text-muted">
                            {periodLabel(r.reportingPeriodStart, r.reportingPeriodEnd)} · Submitted by {r.submittedByUfuk?.name} · {formatDate(r.submittedAt)}
                          </p>
                        </div>
                        <StatusBadge status={r.status} domain="report" />
                      </div>
                      <div className="text-sm text-ink space-y-1.5 bg-paper rounded-lg p-3">
                        {r.narrativeUpdate && <p>{r.narrativeUpdate}</p>}
                        {r.academicProgress && (
                          <p>
                            <span className="text-muted">Academic:</span> {r.academicProgress}
                          </p>
                        )}
                        {r.attendanceSummary && (
                          <p>
                            <span className="text-muted">Attendance:</span> {r.attendanceSummary}
                          </p>
                        )}
                      </div>
                    </>
                  }
                  verification={
                    <form className="space-y-3">
                      <Textarea name="comment" placeholder="Add a comment (required if returning for correction)…" />
                      <div className="flex flex-col gap-2">
                        <Button type="submit" formAction={approveReportAction.bind(null, r.id)} size="sm">
                          Verify
                        </Button>
                        <Button type="submit" formAction={returnReportAction.bind(null, r.id)} variant="outline" size="sm">
                          Request Amendment
                        </Button>
                      </div>
                    </form>
                  }
                />
              ))}
              {reportsApproved.map((r) => (
                <Card key={r.id} className="border-success/30">
                  <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{r.child.displayName}</p>
                      <p className="text-xs text-muted">Approved {formatDate(r.approvedAt)}, ready to publish to sponsor</p>
                    </div>
                    <form action={publishReportAction.bind(null, r.id)}>
                      <Button type="submit" size="sm">
                        Publish to Sponsor
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {tab === "distributions" && (
        <div className="space-y-4">
          {distributions.length === 0 ? (
            <EmptyState title="No distribution evidence waiting for review" />
          ) : (
            distributions.map((d) => (
              <ReviewPanel
                key={d.id}
                submission={
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="font-semibold text-ink">{d.child.displayName}</p>
                        <p className="text-xs text-muted">
                          {d.batch.label} · {formatMoney(d.actualAmount ?? d.expectedAmount, d.currency)} · {formatDate(d.distributionDate)}
                        </p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    {d.evidence.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {d.evidence.map((e) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={e.id} src={e.fileUrl} alt="" className="h-20 w-28 rounded-md object-cover border border-border" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">No evidence attached yet.</p>
                    )}
                  </>
                }
                verification={
                  <form className="space-y-3">
                    <Textarea name="issueNotes" placeholder="Issue notes (required if flagging)…" />
                    <div className="flex flex-col gap-2">
                      <Button type="submit" formAction={verifyDistributionAction.bind(null, d.id)} size="sm">
                        Verify
                      </Button>
                      <Button type="submit" formAction={flagDistributionAction.bind(null, d.id)} variant="outline" size="sm">
                        Flag Issue
                      </Button>
                    </div>
                  </form>
                }
              />
            ))
          )}
        </div>
      )}

      {tab === "media" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {media.length === 0 ? (
            <EmptyState title="No media waiting for approval" />
          ) : (
            media.map((m) => (
              <Card key={m.id} className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.fileUrl} alt="" className="aspect-4/3 w-full object-cover" />
                <CardContent className="p-4">
                  <p className="font-medium text-ink text-sm">{m.child.displayName}</p>
                  <p className="text-xs text-muted mb-3">Uploaded by {m.uploadedBy.name} · {formatDate(m.uploadedAt)}</p>
                  <form className="space-y-2">
                    <select name="visibility" defaultValue={m.visibility} className="w-full rounded-lg border border-border px-2 py-1.5 text-sm">
                      <option value="INTERNAL">Internal only</option>
                      <option value="SPONSOR_ONLY">Sponsor only</option>
                      <option value="PUBLIC_APPROVED">Public approved</option>
                    </select>
                    <div className="flex gap-2">
                      <Button type="submit" formAction={approveMediaAction.bind(null, m.id)} size="sm">
                        Approve
                      </Button>
                      <Button type="submit" formAction={rejectMediaAction.bind(null, m.id)} variant="outline" size="sm">
                        Reject
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "messages" && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <EmptyState title="No messages waiting for moderation" />
          ) : (
            messages.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-ink">
                    {m.sponsor.displayName} → {m.child.displayName} {m.occasion && `· ${m.occasion}`}
                  </p>
                  <p className="text-sm text-ink mt-2">{m.content}</p>
                  <div className="flex gap-2 mt-3">
                    <form action={moderateMessageAction.bind(null, m.id, true)}>
                      <Button type="submit" size="sm">
                        Approve & Deliver
                      </Button>
                    </form>
                    <form action={moderateMessageAction.bind(null, m.id, false)}>
                      <Button type="submit" variant="outline" size="sm">
                        Reject
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "sponsorships" && (
        <div className="space-y-3">
          {sponsorshipRequests.length === 0 ? (
            <EmptyState title="No sponsorship requests waiting for confirmation" />
          ) : (
            sponsorshipRequests.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {s.sponsor.displayName} → {s.child.displayName}
                    </p>
                    <p className="text-xs text-muted">Requested {formatDate(s.createdAt)} · Payment confirmed</p>
                  </div>
                  <form action={confirmSponsorshipAction.bind(null, s.id)}>
                    <Button type="submit" size="sm">
                      Confirm Sponsorship
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
