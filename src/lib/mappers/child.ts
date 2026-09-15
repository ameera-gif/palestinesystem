import type { Child } from "@prisma/client";
import { calculateAge } from "@/lib/format";

/**
 * Privacy boundary for child data. These mappers are the ONLY sanctioned way
 * to turn a Prisma `Child` row into something a public visitor or a sponsor
 * can see. Each is an explicit allow-list — a new column added to the Child
 * model is invisible to sponsors/public until someone deliberately adds it
 * here. Never spread `...child` into a public/sponsor-facing response.
 *
 * Guardian, ChildDocument, ChildConsent and the `fullName`/`schoolName`
 * fields on Child are never referenced below by design.
 */

export type PublicChildCard = {
  id: string;
  slug: string;
  displayName: string;
  age: number;
  gender: "MALE" | "FEMALE";
  region: string;
  educationStage: string | null;
  bio: string | null;
  // Interests/aspirations live on the card (not just the full profile) so
  // the directory can show "Drawing · Football" + a one-line dream instead
  // of a long bio excerpt — see ChildCard.
  interests: string | null;
  aspirations: string | null;
  photoUrl: string | null;
  availableForSponsorship: boolean;
};

export function toPublicChildCard(child: Child): PublicChildCard {
  return {
    id: child.id,
    slug: child.slug,
    displayName: child.displayName,
    age: calculateAge(child.dateOfBirth),
    gender: child.gender,
    region: child.region,
    educationStage: child.educationStage,
    bio: child.bio,
    interests: child.interests,
    aspirations: child.aspirations,
    photoUrl: child.photoUrl,
    availableForSponsorship: child.status === "AVAILABLE",
  };
}

export type PublicChildProfile = PublicChildCard;

export function toPublicChildProfile(child: Child): PublicChildProfile {
  return toPublicChildCard(child);
}

export type SponsorChildView = PublicChildProfile & {
  status: string;
};

/** What a sponsor may see about their own sponsored child — approved fields only. */
export function toSponsorChildView(child: Child): SponsorChildView {
  return {
    ...toPublicChildProfile(child),
    status: child.status,
  };
}
