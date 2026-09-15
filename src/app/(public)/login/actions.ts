"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string } | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "") || "/post-login";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "That email and password combination doesn't match our records." };
    }
    // NEXT_REDIRECT is thrown by a successful signIn() — let Next.js handle it.
    throw error;
  }
}
