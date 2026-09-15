import { prisma } from "@/lib/prisma";

export type JourneyEvent = {
  id: string;
  date: Date;
  icon: "heart" | "check" | "report" | "media" | "meeting";
  title: string;
  summary: string;
  detail?: string;
};

/**
 * One chronological feed for the sponsor dashboard's signature "Our
 * Journey" component — merges sponsorship start, verified support
 * deliveries, published reports, approved sponsor-visible media, and
 * completed meetings into a single timeline. Every source query already
 * filters to what a sponsor is allowed to see (PUBLISHED reports, VERIFIED
 * distributions, APPROVED + sponsor-visible media) — this never bypasses
 * those boundaries, only re-orders what's already sponsor-safe.
 */
export async function buildJourneyEvents(childId: string, sponsorshipStartDate: Date | null): Promise<JourneyEvent[]> {
  const [reports, distributions, media, meetings] = await Promise.all([
    prisma.report.findMany({ where: { childId, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 12 }),
    prisma.distributionRecord.findMany({ where: { childId, status: "VERIFIED" }, orderBy: { verifiedAt: "desc" }, take: 12 }),
    prisma.media.findMany({
      where: { childId, approvalStatus: "APPROVED", visibility: { in: ["SPONSOR_ONLY", "PUBLIC_APPROVED"] } },
      orderBy: { uploadedAt: "desc" },
      take: 12,
    }),
    prisma.meeting.findMany({ where: { childId, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 12 }),
  ]);

  const events: JourneyEvent[] = [];

  if (sponsorshipStartDate) {
    events.push({
      id: "sponsorship-start",
      date: sponsorshipStartDate,
      icon: "heart",
      title: "Sponsorship started",
      summary: "The beginning of this sponsorship.",
    });
  }

  for (const r of reports) {
    if (!r.publishedAt) continue;
    events.push({
      id: `report-${r.id}`,
      date: r.publishedAt,
      icon: "report",
      title: "Progress update",
      summary: r.narrativeUpdate?.slice(0, 140) ?? "A new progress report was published.",
      detail: r.narrativeUpdate ?? undefined,
    });
  }

  for (const d of distributions) {
    if (!d.verifiedAt) continue;
    events.push({
      id: `distribution-${d.id}`,
      date: d.verifiedAt,
      icon: "check",
      title: "Quarterly support received",
      summary: `${d.actualAmount ?? d.expectedAmount} ${d.currency} delivered and verified.`,
    });
  }

  for (const m of media) {
    events.push({
      id: `media-${m.id}`,
      date: m.uploadedAt,
      icon: "media",
      title: m.type === "VIDEO" ? "Video update" : m.type === "PHOTO" ? "Photo update" : "Document shared",
      summary: m.description ?? "New media shared to your dashboard.",
    });
  }

  for (const mt of meetings) {
    if (!mt.completedAt) continue;
    events.push({
      id: `meeting-${mt.id}`,
      date: mt.completedAt,
      icon: "meeting",
      title: "Meeting held",
      summary: mt.sponsorVisibleNotes ?? "A facilitated meeting took place.",
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
