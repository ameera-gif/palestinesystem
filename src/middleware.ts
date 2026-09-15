import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { homeForRole } from "@/lib/role-routes";

// A separate, lightweight NextAuth instance built only from the
// provider-free authConfig — NOT the `auth` exported by src/auth.ts, which
// wires up the Credentials provider (Prisma + bcrypt) and is far too heavy
// for the Edge Runtime's 1MB bundle limit. This instance can still read and
// verify the session JWT (that's all middleware needs); it just can't run
// authorize() to check a password, which middleware never does anyway.
const { auth } = NextAuth(authConfig);

const PORTAL_PREFIX_ROLES: Record<string, string> = {
  "/portal": "SPONSOR",
  "/implementer": "UFUK",
  "/management": "MYFUNDACTION_PC",
  "/admin": "ADMIN",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const matchedPrefix = Object.keys(PORTAL_PREFIX_ROLES).find((p) => pathname.startsWith(p));
  if (!matchedPrefix) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = PORTAL_PREFIX_ROLES[matchedPrefix];
  // ADMIN gets superset access to /management (and /admin) — Admin has no
  // Sponsor or UfukStaff profile record, and /portal + /implementer pages
  // assume a real one exists (e.g. `session.user.profileId!` driving the
  // sponsor/Ufuk dashboard queries), so letting Admin into those wouldn't
  // give oversight, it'd just crash the dashboard. /management's action
  // layer, by contrast, already guards a missing PC profile with a clear
  // error (see pcSession() in management/review/actions.ts) rather than a
  // bare non-null assertion, which is why that one's safe to open up.
  const allowed =
    session.user.role === requiredRole || (session.user.role === "ADMIN" && matchedPrefix !== "/portal" && matchedPrefix !== "/implementer");

  if (!allowed) {
    return NextResponse.redirect(new URL(homeForRole(session.user.role), req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*", "/implementer/:path*", "/management/:path*", "/admin/:path*"],
};
