import { prisma } from "@/lib/prisma";

// Programme economics are configurable (ProgrammeSetting table), never
// hard-coded — the brief is explicit that $50/month, quarterly distribution
// is today's assumption, not a permanent constant. These are the fallbacks
// used only if a key is somehow missing from the table.
export type ProgrammeSettings = {
  monthlySponsorshipAmount: number;
  currency: string;
  distributionFrequencyMonths: number;
  reportingCycleMonths: number;
  meetingCycleMonths: number;
};

const DEFAULTS: ProgrammeSettings = {
  monthlySponsorshipAmount: 50,
  currency: "USD",
  distributionFrequencyMonths: 3,
  reportingCycleMonths: 3,
  meetingCycleMonths: 6,
};

let cache: ProgrammeSettings | null = null;

export async function getProgrammeSettings(): Promise<ProgrammeSettings> {
  if (cache) return cache;
  const rows = await prisma.programmeSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  cache = {
    monthlySponsorshipAmount: Number(map.monthlySponsorshipAmount ?? DEFAULTS.monthlySponsorshipAmount),
    currency: map.currency ?? DEFAULTS.currency,
    distributionFrequencyMonths: Number(
      map.distributionFrequencyMonths ?? DEFAULTS.distributionFrequencyMonths,
    ),
    reportingCycleMonths: Number(map.reportingCycleMonths ?? DEFAULTS.reportingCycleMonths),
    meetingCycleMonths: Number(map.meetingCycleMonths ?? DEFAULTS.meetingCycleMonths),
  };
  return cache;
}

export function invalidateProgrammeSettingsCache() {
  cache = null;
}

export function quarterlyAmount(settings: ProgrammeSettings) {
  return settings.monthlySponsorshipAmount * settings.distributionFrequencyMonths;
}
