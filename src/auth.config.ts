import type { NextAuthConfig } from "next-auth";

// Deliberately no providers here, and nothing that imports Prisma or
// bcrypt. This is the Edge-Runtime-safe half of the auth setup, used by
// middleware.ts — Vercel's Edge Functions have a 1MB bundle limit, and
// Prisma Client + bcrypt alone blow past that. Full auth.ts spreads this
// config and adds the database-backed Credentials provider on top, for use
// everywhere else (API routes, Server Components, Server Actions) that runs
// on the normal Node.js runtime with no such limit.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
        token.role = user.role;
        token.profileId = user.profileId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.profileId = token.profileId;
      return session;
    },
  },
} satisfies NextAuthConfig;
