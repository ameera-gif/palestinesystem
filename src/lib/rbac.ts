import { Role } from "@prisma/client";
import { auth } from "@/auth";

/**
 * Server-side authorization. Every server action and route handler that
 * mutates or reads privileged data MUST call one of these — the UI hides
 * buttons for convenience, but this is the actual gate. Never trust a role
 * check that only exists in a client component.
 */

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthenticatedError extends Error {
  constructor(message = "You must be signed in.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthenticatedError();
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError(`This action requires one of: ${roles.join(", ")}.`);
  }
  return session;
}

/** Home route each role lands on after login. */
export function homeForRole(role: Role): string {
  switch (role) {
    case "SPONSOR":
      return "/portal";
    case "UFUK":
      return "/implementer";
    case "MYFUNDACTION_PC":
      return "/management";
    case "ADMIN":
      return "/admin/users";
    default:
      return "/";
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  SPONSOR: "Sponsor",
  UFUK: "Ufuk Field Team",
  MYFUNDACTION_PC: "MyFundAction Project Coordinator",
  ADMIN: "System Administrator",
};
