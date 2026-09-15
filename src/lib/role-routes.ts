import type { Role } from "@prisma/client";

// Deliberately its own file with zero dependency on @/auth or the Prisma
// Client runtime (the Role import above is `import type`, erased entirely
// at compile time) — middleware.ts needs `homeForRole` and runs on the
// Edge Runtime's 1MB bundle limit, so it imports from here directly rather
// than from lib/rbac.ts, which pulls in the full NextAuth + Prisma + bcrypt
// stack. lib/rbac.ts re-exports both of these for everywhere else that
// isn't size-constrained.

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
  UFUK: "Field Team",
  MYFUNDACTION_PC: "MyFundAction Project Coordinator",
  ADMIN: "System Administrator",
};
