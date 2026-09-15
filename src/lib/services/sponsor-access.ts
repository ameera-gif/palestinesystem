import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Confirms the signed-in sponsor actually sponsors this child before
 * returning anything — the RBAC "sponsor can only see their own sponsored
 * child" rule, enforced at the data-fetch layer, not just by hiding a link.
 */
export async function getSponsorChildOrNotFound(sponsorId: string, childId: string) {
  // PENDING is included deliberately: a sponsor's own "View Profile" button
  // for a match they just requested must not 404 while MyFundAction is
  // still confirming it. Pages under here are expected to check the
  // sponsorship's actual status themselves before showing activity content
  // that may predate the relationship (see /portal/children/[id]/page.tsx).
  // CANCELLED is the one status that should stay unreachable.
  const sponsorship = await prisma.sponsorship.findFirst({
    where: { sponsorId, childId, status: { in: ["PENDING", "ACTIVE", "PAUSED", "PAYMENT_ISSUE", "COMPLETED"] } },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });
  if (!sponsorship) notFound();
  return sponsorship;
}
