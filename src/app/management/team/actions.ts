"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { createStaffUser, setUserActive, UserError } from "@/lib/services/users";

export type CreateUfukState = { error?: string; success?: boolean } | null;

// PC can provision Ufuk field accounts directly — field staff turnover is
// routine, and waiting on the rarely-active Admin role for every new hire
// or departure would be a real operational bottleneck. Role is hard-coded
// to UFUK here regardless of what a request sends; creating PC or Admin
// accounts (a real privilege-escalation surface) stays under /admin/users.
export async function createUfukStaffAction(_prev: CreateUfukState, formData: FormData): Promise<CreateUfukState> {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Please provide a name, email, and password of at least 8 characters." };
  }

  try {
    await createStaffUser({ name, email, password, role: "UFUK" }, session.user.id);
    revalidatePath("/management/team");
    return { success: true };
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
}

// Same defense-in-depth pattern used throughout: verify server-side that the
// target is actually Ufuk staff, so this PC-facing endpoint can never be
// used to deactivate a PC or Admin peer even via a crafted request.
export async function toggleUfukStaffActiveAction(userId: string, isActive: boolean) {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role !== "UFUK") {
    throw new ForbiddenError("This action can only be used on Ufuk field staff accounts.");
  }

  await setUserActive(userId, isActive, session.user.id);
  revalidatePath("/management/team");
}
