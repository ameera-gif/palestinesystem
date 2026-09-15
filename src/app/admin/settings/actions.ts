"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { invalidateProgrammeSettingsCache } from "@/lib/settings";
import { recordAudit } from "@/lib/services/audit";

// PC manages the programme day to day — the sponsorship amount, currency,
// and cycle lengths are programme decisions PC makes, not a technical
// system setting reserved for the rarely-active Admin role. Admin keeps
// access too (e.g. as an override / for initial setup).
export async function updateSettingsAction(formData: FormData) {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");

  const entries: [string, string][] = [
    ["monthlySponsorshipAmount", String(formData.get("monthlySponsorshipAmount") ?? "50")],
    ["currency", String(formData.get("currency") ?? "USD")],
    ["distributionFrequencyMonths", String(formData.get("distributionFrequencyMonths") ?? "3")],
    ["reportingCycleMonths", String(formData.get("reportingCycleMonths") ?? "3")],
    ["meetingCycleMonths", String(formData.get("meetingCycleMonths") ?? "6")],
  ];

  for (const [key, value] of entries) {
    await prisma.programmeSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  invalidateProgrammeSettingsCache();

  await recordAudit({
    actorId: session.user.id,
    action: "PROGRAMME_SETTINGS_UPDATED",
    entityType: "ProgrammeSetting",
    entityId: "global",
    summary: "Programme settings updated.",
    metadata: Object.fromEntries(entries),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/management/settings");
}
