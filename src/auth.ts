import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

// Full auth setup — Node.js runtime only (API routes, Server Components,
// Server Actions), never imported by middleware.ts directly. See
// auth.config.ts for why that split exists.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Resolve the linked domain-profile id so downstream code doesn't
        // need an extra query on every request just to find "which sponsor
        // record does this user own".
        let profileId: string | null = null;
        if (user.role === "SPONSOR") {
          profileId = (await prisma.sponsor.findUnique({ where: { userId: user.id } }))?.id ?? null;
        } else if (user.role === "UFUK") {
          profileId = (await prisma.ufukStaff.findUnique({ where: { userId: user.id } }))?.id ?? null;
        } else if (user.role === "MYFUNDACTION_PC") {
          profileId = (await prisma.projectCoordinator.findUnique({ where: { userId: user.id } }))?.id ?? null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileId,
        };
      },
    }),
  ],
});
