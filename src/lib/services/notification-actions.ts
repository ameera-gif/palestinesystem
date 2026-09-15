"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(id: string, returnPath: string) {
  const session = await requireSession();
  await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { isRead: true } });
  revalidatePath(returnPath);
}

export async function markAllNotificationsRead(returnPath: string) {
  const session = await requireSession();
  await prisma.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
  revalidatePath(returnPath);
}
