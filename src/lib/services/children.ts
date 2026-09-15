import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/services/audit";

export class ChildError extends Error {}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type ChildFormInput = {
  displayName: string;
  fullName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  region: string;
  bio?: string;
  interests?: string;
  aspirations?: string;
  educationStage?: string;
  schoolName?: string;
  assignedUfukStaffId?: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone?: string;
  guardianAddress?: string;
  householdNotes?: string;
};

export async function createChild(input: ChildFormInput, actorUserId: string) {
  const count = await prisma.child.count();
  const childCode = `GZ-${String(count + 1).padStart(4, "0")}`;
  const slug = `${slugify(input.displayName)}-${childCode.toLowerCase()}`;

  const child = await prisma.child.create({
    data: {
      childCode,
      slug,
      displayName: input.displayName,
      fullName: input.fullName,
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender,
      region: input.region,
      bio: input.bio,
      interests: input.interests,
      aspirations: input.aspirations,
      educationStage: input.educationStage,
      schoolName: input.schoolName,
      assignedUfukStaffId: input.assignedUfukStaffId || null,
      status: "DRAFT",
      guardian: {
        create: {
          name: input.guardianName,
          relationship: input.guardianRelationship,
          phone: input.guardianPhone,
          address: input.guardianAddress,
          householdNotes: input.householdNotes,
        },
      },
      statusHistory: {
        create: { toStatus: "DRAFT", reason: "Initial registration by field team.", changedById: actorUserId },
      },
    },
  });

  await recordAudit({
    actorId: actorUserId,
    action: "CHILD_REGISTERED",
    entityType: "Child",
    entityId: child.id,
    summary: `${child.displayName} (${child.childCode}) registered.`,
  });

  return child;
}

export async function updateChildProfile(childId: string, input: Partial<ChildFormInput>, actorUserId: string) {
  const child = await prisma.child.update({
    where: { id: childId },
    data: {
      displayName: input.displayName,
      fullName: input.fullName,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      region: input.region,
      bio: input.bio,
      interests: input.interests,
      aspirations: input.aspirations,
      educationStage: input.educationStage,
      schoolName: input.schoolName,
      assignedUfukStaffId: input.assignedUfukStaffId || undefined,
    },
  });

  await recordAudit({
    actorId: actorUserId,
    action: "CHILD_PROFILE_UPDATED",
    entityType: "Child",
    entityId: child.id,
    summary: `${child.displayName}'s profile was updated.`,
  });

  return child;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ELIGIBLE"],
  ELIGIBLE: ["AVAILABLE", "ON_HOLD"],
  AVAILABLE: ["ON_HOLD", "EXITED"],
  SPONSORED: ["ON_HOLD", "EXITED"],
  ON_HOLD: ["AVAILABLE", "ELIGIBLE", "EXITED"],
  EXITED: [],
};

export async function changeChildStatus(childId: string, toStatus: string, reason: string, actorUserId: string) {
  if (!reason.trim()) throw new ChildError("A reason is required for this status change.");

  const child = await prisma.child.findUniqueOrThrow({ where: { id: childId } });
  const allowed = VALID_TRANSITIONS[child.status] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new ChildError(`Cannot move a child from ${child.status} to ${toStatus} directly.`);
  }

  await prisma.$transaction([
    prisma.child.update({ where: { id: childId }, data: { status: toStatus as never } }),
    prisma.childStatusHistory.create({
      data: { childId, fromStatus: child.status, toStatus: toStatus as never, reason, changedById: actorUserId },
    }),
  ]);

  await recordAudit({
    actorId: actorUserId,
    action: "CHILD_STATUS_CHANGED",
    entityType: "Child",
    entityId: childId,
    summary: `${child.displayName} moved from ${child.status} to ${toStatus}: ${reason}`,
  });
}
