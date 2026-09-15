import { prisma } from "@/lib/prisma";
import { getProgrammeSettings } from "@/lib/settings";
import { recordAudit } from "@/lib/services/audit";
import { notify, notifyAllProjectCoordinators } from "@/lib/services/notifications";

export class SponsorshipError extends Error {}

/**
 * Step 1 of the matching workflow: a sponsor picks a child. This does NOT
 * mark the child SPONSORED yet — only MyFundAction confirming the request
 * does that (see confirmSponsorshipRequest below). Guards against a second
 * sponsor requesting a child that already has a pending/active sponsorship,
 * per the brief's "avoid accidental double sponsorship" requirement.
 */
export async function createSponsorshipRequest(sponsorId: string, childId: string) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw new SponsorshipError("Child not found.");
  if (child.status !== "AVAILABLE") {
    throw new SponsorshipError("This child is no longer available for sponsorship.");
  }

  const existing = await prisma.sponsorship.findFirst({
    where: { childId, status: { in: ["PENDING", "ACTIVE"] } },
  });
  if (existing) {
    throw new SponsorshipError("This child already has a sponsorship request in progress.");
  }

  const settings = await getProgrammeSettings();

  const sponsorship = await prisma.sponsorship.create({
    data: {
      sponsorId,
      childId,
      status: "PENDING",
      monthlyAmount: settings.monthlySponsorshipAmount,
      currency: settings.currency,
      paymentFrequency: "QUARTERLY",
    },
  });

  await recordAudit({
    actorId: null,
    action: "SPONSORSHIP_REQUESTED",
    entityType: "Sponsorship",
    entityId: sponsorship.id,
    summary: `Sponsorship requested for ${child.displayName} (${child.childCode}).`,
  });

  await notifyAllProjectCoordinators({
    title: "New sponsorship request",
    body: `A sponsor has requested to sponsor ${child.displayName} (${child.childCode}). Confirm the match once payment is verified.`,
    entityType: "Sponsorship",
    entityId: sponsorship.id,
    link: "/management/sponsorships",
  });

  return sponsorship;
}

/** Stub "payment confirmed" step — see ARCHITECTURE.md #17 on the payment gateway being out of scope for this build. */
export async function stubConfirmPayment(sponsorshipId: string) {
  const sponsorship = await prisma.sponsorship.findUniqueOrThrow({ where: { id: sponsorshipId } });
  await prisma.sponsorshipTransaction.create({
    data: {
      sponsorshipId,
      periodLabel: "Initial sponsorship confirmation",
      amount: sponsorship.monthlyAmount * 3,
      currency: sponsorship.currency,
      status: "CONFIRMED",
      method: "stub",
      paidAt: new Date(),
    },
  });
}

/** Step 2: MyFundAction confirms the match. This is the moment the child flips to SPONSORED. */
export async function confirmSponsorshipRequest(sponsorshipId: string, pcId: string, pcUserId: string) {
  const sponsorship = await prisma.sponsorship.findUniqueOrThrow({
    where: { id: sponsorshipId },
    include: { child: true, sponsor: true },
  });
  if (sponsorship.status !== "PENDING") {
    throw new SponsorshipError("Only pending sponsorship requests can be confirmed.");
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: { status: "ACTIVE", startDate: now, confirmedById: pcId, confirmedAt: now },
    }),
    prisma.child.update({ where: { id: sponsorship.childId }, data: { status: "SPONSORED" } }),
    prisma.childStatusHistory.create({
      data: {
        childId: sponsorship.childId,
        fromStatus: "AVAILABLE",
        toStatus: "SPONSORED",
        reason: "Sponsorship match confirmed by MyFundAction.",
        changedById: pcUserId,
      },
    }),
  ]);

  await recordAudit({
    actorId: pcUserId,
    action: "SPONSORSHIP_CONFIRMED",
    entityType: "Sponsorship",
    entityId: sponsorship.id,
    summary: `Sponsorship of ${sponsorship.child.displayName} confirmed; child status set to Sponsored.`,
  });

  await notify({
    userId: sponsorship.sponsor.userId,
    title: "Your sponsorship is confirmed!",
    body: `Thank you — your sponsorship of ${sponsorship.child.displayName} is now active. You'll receive verified updates here.`,
    entityType: "Sponsorship",
    entityId: sponsorship.id,
    link: `/portal/children/${sponsorship.childId}`,
  });
}

export async function pauseSponsorship(sponsorshipId: string, reason: string, actorUserId: string) {
  const sponsorship = await prisma.sponsorship.update({
    where: { id: sponsorshipId },
    data: { status: "PAUSED", pausedReason: reason },
    include: { child: true },
  });
  await recordAudit({
    actorId: actorUserId,
    action: "SPONSORSHIP_PAUSED",
    entityType: "Sponsorship",
    entityId: sponsorship.id,
    summary: `Sponsorship of ${sponsorship.child.displayName} paused: ${reason}`,
  });
}

export async function resumeSponsorship(sponsorshipId: string, actorUserId: string) {
  const sponsorship = await prisma.sponsorship.update({
    where: { id: sponsorshipId },
    data: { status: "ACTIVE", pausedReason: null },
    include: { child: true },
  });
  await recordAudit({
    actorId: actorUserId,
    action: "SPONSORSHIP_RESUMED",
    entityType: "Sponsorship",
    entityId: sponsorship.id,
    summary: `Sponsorship of ${sponsorship.child.displayName} resumed.`,
  });
}
