"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { recordDistributionDelivery, attachDistributionEvidence } from "@/lib/services/distributions";

export async function recordDeliveryAction(batchId: string, recordId: string, formData: FormData) {
  await requireRole("UFUK");
  const actualAmount = Number(formData.get("actualAmount") ?? 0);
  const distributionDate = String(formData.get("distributionDate") ?? "");
  const method = String(formData.get("method") ?? "Cash assistance via guardian");
  const recipientNote = String(formData.get("recipientNote") ?? "") || undefined;

  await recordDistributionDelivery(recordId, { actualAmount, distributionDate, method, recipientNote });
  revalidatePath(`/implementer/distributions/${batchId}`);
}

export async function attachEvidenceAction(batchId: string, recordId: string, formData: FormData) {
  const session = await requireRole("UFUK");
  const fileUrl = String(formData.get("fileUrl") ?? "");
  const description = String(formData.get("description") ?? "") || undefined;
  if (!fileUrl) return;

  await attachDistributionEvidence(recordId, [{ fileUrl, fileType: "PHOTO", description }], session.user.id);
  revalidatePath(`/implementer/distributions/${batchId}`);
}
