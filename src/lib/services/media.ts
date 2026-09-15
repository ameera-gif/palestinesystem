import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/services/audit";
import { notifyAllProjectCoordinators } from "@/lib/services/notifications";

export class MediaError extends Error {}

export async function uploadMedia(
  ufukId: string,
  input: {
    childId: string;
    type: "PHOTO" | "VIDEO" | "DOCUMENT";
    fileUrl: string;
    description?: string;
    reportingPeriodLabel?: string;
    purpose?: string;
    visibility: "INTERNAL" | "SPONSOR_ONLY" | "PUBLIC_APPROVED";
    consentConfirmed: boolean;
  },
) {
  if (!input.consentConfirmed) {
    throw new MediaError("Consent must be confirmed before media can be uploaded.");
  }

  const media = await prisma.media.create({
    data: {
      childId: input.childId,
      type: input.type,
      fileUrl: input.fileUrl,
      description: input.description,
      reportingPeriodLabel: input.reportingPeriodLabel,
      purpose: input.purpose,
      visibility: input.visibility,
      consentConfirmed: input.consentConfirmed,
      uploadedById: ufukId,
      approvalStatus: "PENDING",
    },
    include: { child: true },
  });

  await notifyAllProjectCoordinators({
    title: "New media awaiting approval",
    body: `New media for ${media.child.displayName} needs visibility approval before it can be shown.`,
    entityType: "Media",
    entityId: media.id,
    link: "/management/review",
  });

  return media;
}

export async function reviewMedia(
  mediaId: string,
  approve: boolean,
  pcId: string,
  pcUserId: string,
  visibility?: "INTERNAL" | "SPONSOR_ONLY" | "PUBLIC_APPROVED",
  comment?: string,
) {
  const media = await prisma.media.update({
    where: { id: mediaId },
    data: {
      approvalStatus: approve ? "APPROVED" : "REJECTED",
      visibility: approve && visibility ? visibility : undefined,
      reviewedById: pcId,
      reviewedAt: new Date(),
      reviewComment: comment,
    },
    include: { child: true },
  });

  await recordAudit({
    actorId: pcUserId,
    action: approve ? "MEDIA_APPROVED" : "MEDIA_REJECTED",
    entityType: "Media",
    entityId: mediaId,
    summary: `Media for ${media.child.displayName} ${approve ? `approved (${media.visibility})` : "rejected"}.`,
  });

  return media;
}
