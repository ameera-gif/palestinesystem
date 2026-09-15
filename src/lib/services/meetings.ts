import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/services/audit";
import { notifyUfukUser, notify } from "@/lib/services/notifications";

export class MeetingError extends Error {}

/** MyFundAction identifies a meeting is due and requests Ufuk's availability. */
export async function requestUfukAvailability(childId: string, sponsorId: string, cycleLabel: string, pcId: string, pcUserId: string) {
  const child = await prisma.child.findUniqueOrThrow({ where: { id: childId } });
  const meeting = await prisma.meeting.create({
    data: { childId, sponsorId, cycleLabel, status: "AWAITING_UFUK", responsiblePcId: pcId },
  });

  if (child.assignedUfukStaffId) {
    await notifyUfukUser(child.assignedUfukStaffId, {
      title: "Meeting availability needed",
      body: `Please confirm ${child.displayName}'s availability for an upcoming sponsor meeting.`,
      entityType: "Meeting",
      entityId: meeting.id,
      link: "/implementer/meetings",
    });
  }

  await recordAudit({
    actorId: pcUserId,
    action: "MEETING_AVAILABILITY_REQUESTED",
    entityType: "Meeting",
    entityId: meeting.id,
    summary: `Availability requested from Ufuk for ${child.displayName}'s sponsor meeting.`,
  });

  return meeting;
}

export async function confirmUfukAvailability(meetingId: string, ufukId: string, notes: string | undefined) {
  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: "COORDINATING", ufukRepId: ufukId, internalNotes: notes },
    include: { child: true },
  });

  await recordAudit({
    actorId: null,
    action: "MEETING_AVAILABILITY_CONFIRMED",
    entityType: "Meeting",
    entityId: meetingId,
    summary: `Ufuk confirmed availability for ${meeting.child.displayName}'s meeting.`,
  });

  return meeting;
}

export async function scheduleMeeting(
  meetingId: string,
  input: { scheduledDate: string; timezone: string; platform: "GOOGLE_MEET" | "ZOOM" | "TEAMS" | "OTHER"; meetingLink: string },
  pcUserId: string,
) {
  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      status: "SCHEDULED",
      scheduledDate: new Date(input.scheduledDate),
      timezone: input.timezone,
      platform: input.platform,
      meetingLink: input.meetingLink,
    },
    include: { child: true, sponsor: true },
  });

  await recordAudit({
    actorId: pcUserId,
    action: "MEETING_SCHEDULED",
    entityType: "Meeting",
    entityId: meetingId,
    summary: `Meeting with ${meeting.child.displayName} scheduled.`,
  });

  await notify({
    userId: meeting.sponsor.userId,
    title: "Your meeting is scheduled",
    body: `Your meeting with ${meeting.child.displayName} is scheduled. A MyFundAction representative will facilitate.`,
    entityType: "Meeting",
    entityId: meetingId,
    link: "/portal/meetings",
  });

  return meeting;
}

export async function completeMeeting(meetingId: string, pcUserId: string) {
  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: "COMPLETED", completedAt: new Date() },
    include: { child: true },
  });
  await recordAudit({
    actorId: pcUserId,
    action: "MEETING_COMPLETED",
    entityType: "Meeting",
    entityId: meetingId,
    summary: `Meeting with ${meeting.child.displayName} completed.`,
  });
  return meeting;
}

export async function cancelMeeting(meetingId: string, reason: string, pcUserId: string) {
  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: "CANCELLED", cancelledReason: reason },
    include: { child: true },
  });
  await recordAudit({
    actorId: pcUserId,
    action: "MEETING_CANCELLED",
    entityType: "Meeting",
    entityId: meetingId,
    summary: `Meeting with ${meeting.child.displayName} cancelled: ${reason}`,
  });
  return meeting;
}
