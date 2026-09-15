import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/services/audit";
import { notifyAllProjectCoordinators, notify } from "@/lib/services/notifications";

export class MessageError extends Error {}

/** Sponsor -> child greeting. Always starts as SUBMITTED and needs PC moderation before Ufuk delivers it. */
export async function submitSponsorMessage(sponsorId: string, childId: string, occasion: string, content: string) {
  const sponsorship = await prisma.sponsorship.findFirst({
    where: { sponsorId, childId, status: { in: ["ACTIVE", "PAUSED"] } },
  });
  if (!sponsorship) throw new MessageError("You can only message a child you currently sponsor.");
  if (!content.trim()) throw new MessageError("Message cannot be empty.");

  const message = await prisma.message.create({
    data: { sponsorId, childId, direction: "SPONSOR_TO_CHILD", occasion, content: content.trim(), status: "SUBMITTED" },
  });

  await notifyAllProjectCoordinators({
    title: "New sponsor message to moderate",
    body: `A sponsor has written a message — please review before it's delivered.`,
    entityType: "Message",
    entityId: message.id,
    link: "/management/review",
  });

  return message;
}

/** PC moderation decision on a message in either direction. */
export async function moderateMessage(messageId: string, approve: boolean, pcUserId: string, comment?: string) {
  const message = await prisma.message.findUniqueOrThrow({ where: { id: messageId }, include: { sponsor: true } });

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      reviewedById: pcUserId,
      reviewedAt: new Date(),
      reviewComment: comment,
      deliveredAt: approve ? new Date() : null,
    },
  });

  await recordAudit({
    actorId: pcUserId,
    action: approve ? "MESSAGE_APPROVED" : "MESSAGE_REJECTED",
    entityType: "Message",
    entityId: messageId,
    summary: `${message.direction === "SPONSOR_TO_CHILD" ? "Sponsor" : "Child"} message ${approve ? "approved and delivered" : "rejected"}.`,
  });

  if (approve && message.direction === "CHILD_TO_SPONSOR") {
    await notify({
      userId: message.sponsor.userId,
      title: "You have a new message",
      body: "A message from your sponsored child has been reviewed and delivered.",
      entityType: "Message",
      entityId: messageId,
      link: "/portal/messages",
    });
  }

  return updated;
}
