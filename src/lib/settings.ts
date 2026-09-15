import { prisma } from "@/lib/prisma";

// Programme economics are configurable (ProgrammeSetting table), never
// hard-coded — the brief is explicit that $50/month, quarterly distribution
// is today's assumption, not a permanent constant. These are the fallbacks
// used only if a key is somehow missing from the table.
//
// The same table also holds the organisation's public-facing text (About
// page description, footer tagline, registered address, phone) — content
// that used to be hard-coded directly in page components. Routing it
// through here means PC/Admin can edit it from /management/settings or
// /admin/settings without needing a code change, the same way they already
// edit the sponsorship amount.
export type ProgrammeSettings = {
  monthlySponsorshipAmount: number;
  currency: string;
  distributionFrequencyMonths: number;
  reportingCycleMonths: number;
  meetingCycleMonths: number;
  orgDescription: string;
  footerTagline: string;
  orgAddress: string;
  orgPhone: string;
};

const DEFAULTS: ProgrammeSettings = {
  monthlySponsorshipAmount: 50,
  currency: "USD",
  distributionFrequencyMonths: 3,
  reportingCycleMonths: 3,
  meetingCycleMonths: 6,
  orgDescription:
    "MyFundAction is a registered organisation that focuses on youth development in three main aspects: volunteerism, entrepreneurship, and academic excellence. We believe that a well-developed youth will further revamp the social and economic standard of a nation. With the tagline “For The Best Future,” we aim to be the best platform to develop future global leaders amongst the youth for a better tomorrow.",
  footerTagline:
    "MyFundAction develops youth through volunteerism, entrepreneurship, and academic excellence, for the best future. This Gaza Child Sponsorship Programme is delivered with our field partner.",
  orgAddress:
    "SH-G-26, Pangsapuri Perkhidmatan Knox Wawasan,\nJalan Sungai Burung 32/68, Seksyen 32, Bukit Rimau,\n40460 Shah Alam, Selangor Darul Ehsan",
  orgPhone: "+603 5525 3963",
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
    orgDescription: map.orgDescription ?? DEFAULTS.orgDescription,
    footerTagline: map.footerTagline ?? DEFAULTS.footerTagline,
    orgAddress: map.orgAddress ?? DEFAULTS.orgAddress,
    orgPhone: map.orgPhone ?? DEFAULTS.orgPhone,
  };
  return cache;
}

export function invalidateProgrammeSettingsCache() {
  cache = null;
}

export function quarterlyAmount(settings: ProgrammeSettings) {
  return settings.monthlySponsorshipAmount * settings.distributionFrequencyMonths;
}
