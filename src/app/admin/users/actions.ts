"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { createStaffUser, setUserActive, UserError } from "@/lib/services/users";

export type CreateUserState = { error?: string; success?: boolean } | null;

export async function createStaffUserAction(_prev: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const session = await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "UFUK") as "UFUK" | "MYFUNDACTION_PC" | "ADMIN";

  if (!name || !email || password.length < 8) {
    return { error: "Please provide a name, email, and password of at least 8 characters." };
  }

  try {
    await createStaffUser({ name, email, password, role }, session.user.id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const session = await requireRole("ADMIN");
  await setUserActive(userId, isActive, session.user.id);
  revalidatePath("/admin/users");
}
