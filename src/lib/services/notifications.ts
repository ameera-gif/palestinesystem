import { prisma } from "@/lib/prisma";

/**
 * In-app notifications only for this build. Architected so an email/WhatsApp
 * channel can be added later as another "sink" fed by the same call sites
 * (e.g. swap `notify()` internals to also enqueue an email job) without
 * touching any of the calling code in the services below.
 */
export async function notify(params: {
  userId: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      body: params.body,
      entityType: params.entityType,
      entityId: params.entityId,
      link: params.link,
    },
  });
}

export async function notifySponsorUsersOfSponsor(sponsorId: string, params: Omit<Parameters<typeof notify>[0], "userId">) {
  const sponsor = await prisma.sponsor.findUnique({ where: { id: sponsorId }, select: { userId: true } });
  if (!sponsor) return;
  await notify({ ...params, userId: sponsor.userId });
}

export async function notifyAllProjectCoordinators(params: Omit<Parameters<typeof notify>[0], "userId">) {
  const pcs = await prisma.projectCoordinator.findMany({ select: { userId: true } });
  await Promise.all(pcs.map((pc) => notify({ ...params, userId: pc.userId })));
}

export async function notifyUfukUser(ufukStaffId: string, params: Omit<Parameters<typeof notify>[0], "userId">) {
  const ufuk = await prisma.ufukStaff.findUnique({ where: { id: ufukStaffId }, select: { userId: true } });
  if (!ufuk) return;
  await notify({ ...params, userId: ufuk.userId });
}
