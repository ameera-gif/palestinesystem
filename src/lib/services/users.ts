import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/services/audit";

export class UserError extends Error {}

export async function createStaffUser(input: { name: string; email: string; password: string; role: "UFUK" | "MYFUNDACTION_PC" | "ADMIN" }, actorUserId: string) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new UserError("A user with this email already exists.");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash, role: input.role },
  });

  if (input.role === "UFUK") {
    await prisma.ufukStaff.create({ data: { userId: user.id, name: input.name } });
  } else if (input.role === "MYFUNDACTION_PC") {
    await prisma.projectCoordinator.create({ data: { userId: user.id, name: input.name } });
  }

  await recordAudit({
    actorId: actorUserId,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    summary: `${input.name} created with role ${input.role}.`,
  });

  return user;
}

export async function setUserActive(userId: string, isActive: boolean, actorUserId: string) {
  const user = await prisma.user.update({ where: { id: userId }, data: { isActive } });
  await recordAudit({
    actorId: actorUserId,
    action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
    entityType: "User",
    entityId: userId,
    summary: `${user.name} ${isActive ? "activated" : "deactivated"}.`,
  });
  return user;
}
