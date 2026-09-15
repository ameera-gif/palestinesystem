import { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Module augmentation so `session.user.role` / `.id` are typed everywhere
// instead of casting to `any` at every call site.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      profileId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    profileId: string | null;
  }
}

// Same story as the JWT module below: `next-auth`'s Session/User types are
// re-exported from `@auth/core/types`, which is what the callback signatures
// actually reference.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: Role;
      profileId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    profileId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: Role;
    profileId: string | null;
  }
}

// NextAuth v5's `next-auth/jwt` module re-exports from `@auth/core/jwt`, and
// the callback types in the core config reference that module directly — so
// the augmentation needs to land there too or `token.*` stays `unknown`.
declare module "@auth/core/jwt" {
  interface JWT {
    uid: string;
    role: Role;
    profileId: string | null;
  }
}
