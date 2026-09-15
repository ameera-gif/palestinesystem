import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/services/audit";
import { notifyAllProjectCoordinators, notifySponsorUsersOfSponsor } from "@/lib/services/notifications";

export class DistributionError extends Error {}

export async function createDistributionBatch(
  ufukId: string,
  label: string,
  periodStart: string,
  periodEnd: string,
  childIds: string[],
  expectedAmountByChild: Record<string, number>,
  notes?: string,
) {
  if (childIds.length === 0) throw new DistributionError("Select at least one child.");

  const batch = await prisma.distributionBatch.create({
    data: {
      label,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      notes,
      createdByUfukId: ufukId,
      records: {
        create: childIds.map((childId) => ({
          childId,
          expectedAmount: expectedAmountByChild[childId] ?? 150,
          status: "PLANNED",
        })),
      },
    },
    include: { records: true },
  });

  await recordAudit({
    actorId: null,
    action: "DISTRIBUTION_BATCH_CREATED",
    entityType: "DistributionBatch",
    entityId: batch.id,
    summary: `Distribution batch "${label}" created for ${childIds.length} children.`,
  });

  return batch;
}

export async function recordDistributionDelivery(
  recordId: string,
  input: { actualAmount: number; distributionDate: string; method: string; recipientNote?: string; notes?: string },
) {
  const record = await prisma.distributionRecord.update({
    where: { id: recordId },
    data: {
      actualAmount: input.actualAmount,
      distributionDate: new Date(input.distributionDate),
      method: input.method,
      recipientNote: input.recipientNote,
      notes: input.notes,
      status: "DISTRIBUTED",
    },
    include: { child: true },
  });

  await recordAudit({
    actorId: null,
    action: "DISTRIBUTION_RECORDED",
    entityType: "DistributionRecord",
    entityId: record.id,
    summary: `Support delivery recorded for ${record.child.displayName}.`,
  });

  return record;
}

export async function attachDistributionEvidence(
  recordId: string,
  files: { fileUrl: string; fileType: "PHOTO" | "VIDEO" | "DOCUMENT"; description?: string }[],
  uploadedById: string,
) {
  await prisma.distributionEvidence.createMany({
    data: files.map((f) => ({ distributionRecordId: recordId, fileUrl: f.fileUrl, fileType: f.fileType, description: f.description, uploadedById })),
  });
  const record = await prisma.distributionRecord.update({
    where: { id: recordId },
    data: { status: "EVIDENCE_SUBMITTED" },
    include: { child: true },
  });

  await notifyAllProjectCoordinators({
    title: "Distribution evidence submitted",
    body: `Evidence for ${record.child.displayName}'s support delivery is ready for verification.`,
    entityType: "DistributionRecord",
    entityId: record.id,
    link: "/management/review",
  });

  return record;
}

export async function verifyDistribution(recordId: string, pcId: string, pcUserId: string) {
  const record = await prisma.distributionRecord.findUniqueOrThrow({
    where: { id: recordId },
    include: { child: { include: { sponsorships: { where: { status: "ACTIVE" } } } } },
  });
  if (!["EVIDENCE_SUBMITTED", "DISTRIBUTED", "UNDER_REVIEW"].includes(record.status)) {
    throw new DistributionError("This record is not ready for verification.");
  }

  await prisma.distributionRecord.update({
    where: { id: recordId },
    data: { status: "VERIFIED", verifiedByPcId: pcId, verifiedAt: new Date() },
  });

  await recordAudit({
    actorId: pcUserId,
    action: "DISTRIBUTION_VERIFIED",
    entityType: "DistributionRecord",
    entityId: recordId,
    summary: `Support delivery for ${record.child.displayName} verified.`,
  });

  for (const sponsorship of record.child.sponsorships) {
    await notifySponsorUsersOfSponsor(sponsorship.sponsorId, {
      title: "Support delivered",
      body: `Support for ${record.child.displayName} has been verified and delivered.`,
      entityType: "DistributionRecord",
      entityId: recordId,
      link: `/portal/children/${record.childId}/support`,
    });
  }
}

export async function flagDistributionIssue(recordId: string, pcUserId: string, issueNotes: string) {
  const record = await prisma.distributionRecord.update({
    where: { id: recordId },
    data: { status: "ISSUE_FLAGGED", issueNotes },
    include: { child: true },
  });

  await recordAudit({
    actorId: pcUserId,
    action: "DISTRIBUTION_ISSUE_FLAGGED",
    entityType: "DistributionRecord",
    entityId: recordId,
    summary: `Issue flagged on support delivery for ${record.child.displayName}: ${issueNotes}`,
  });
}
