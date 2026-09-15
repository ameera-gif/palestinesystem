import type { Role } from "@prisma/client";
import { auth } from "@/auth";

export { homeForRole, ROLE_LABELS } from "@/lib/role-routes";

/**
 * Server-side authorization. Every server action and route handler that
 * mutates or reads privileged data MUST call one of these — the UI hides
 * buttons for convenience, but this is the actual gate. Never trust a role
 * check that only exists in a client component.
 *
 * This file pulls in the full auth() (Prisma + bcrypt + Credentials
 * provider) and is only safe to import from Node.js-runtime code — Server
 * Components, Server Actions, API routes. middleware.ts runs on the Edge
 * Runtime and must NOT import from here; see lib/role-routes.ts for the
 * one piece (homeForRole) it needs instead.
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
