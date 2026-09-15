"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export type SignupState = { error?: string } | null;

export async function signupAction(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const country = String(formData.get("country") ?? "").trim();
  const childId = String(formData.get("childId") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Please provide your name, a valid email, and a password of at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Please sign in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: "SPONSOR" },
  });
  await prisma.sponsor.create({
    data: { userId: user.id, displayName: name, country: country || null },
  });

  const callbackUrl = childId ? `/portal/sponsor/${childId}` : "/post-login";

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created. Please sign in." };
    }
    throw error;
  }
}
