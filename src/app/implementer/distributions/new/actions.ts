"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { createDistributionBatch, DistributionError } from "@/lib/services/distributions";
import { getProgrammeSettings, quarterlyAmount } from "@/lib/settings";

export type BatchFormState = { error?: string } | null;

export async function createBatchAction(_prev: BatchFormState, formData: FormData): Promise<BatchFormState> {
  const session = await requireRole("UFUK");
  if (!session.user.profileId) return { error: "Ufuk profile not found." };

  const label = String(formData.get("label") ?? "");
  const periodStart = String(formData.get("periodStart") ?? "");
  const periodEnd = String(formData.get("periodEnd") ?? "");
  const childIds = formData.getAll("childIds").map(String);

  if (!label || !periodStart || !periodEnd) return { error: "Please fill in the batch label and period." };
  if (childIds.length === 0) return { error: "Select at least one child for this batch." };

  const settings = await getProgrammeSettings();
  const amount = quarterlyAmount(settings);
  const expectedAmountByChild = Object.fromEntries(childIds.map((id) => [id, amount]));

  try {
    const batch = await createDistributionBatch(
      session.user.profileId,
      label,
      periodStart,
      periodEnd,
      childIds,
      expectedAmountByChild,
    );
    redirect(`/implementer/distributions/${batch.id}`);
  } catch (error) {
    if (error instanceof DistributionError) return { error: error.message };
    throw error;
  }
}
