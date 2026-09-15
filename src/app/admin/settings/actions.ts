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
//
// The settings page submits two independent forms (programme economics,
// organisation info) that each POST here. Only upserting keys actually
// present in the submitted FormData — instead of defaulting every known
// key on every submit — means saving one form can never silently reset
// the other's values back to a fallback.
const SETTINGS_KEYS = [
  "monthlySponsorshipAmount",
  "currency",
  "distributionFrequencyMonths",
  "reportingCycleMonths",
  "meetingCycleMonths",
  "orgDescription",
  "footerTagline",
  "orgAddress",
  "orgPhone",
] as const;

export async function updateSettingsAction(formData: FormData) {
  const session = await requireRole("MYFUNDACTION_PC", "ADMIN");

  const entries: [string, string][] = SETTINGS_KEYS.filter((key) => formData.has(key)).map((key) => [
    key,
    String(formData.get(key) ?? ""),
  ]);

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
  // Organisation info (description, footer tagline, address, phone) shows
  // up on the public site too — About, Contact, and the footer on every
  // page — so a save here needs to bust more than just the settings pages.
  revalidatePath("/", "layout");
}
