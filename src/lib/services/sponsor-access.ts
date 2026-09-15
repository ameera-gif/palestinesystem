import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Confirms the signed-in sponsor actually sponsors this child before
 * returning anything — the RBAC "sponsor can only see their own sponsored
 * child" rule, enforced at the data-fetch layer, not just by hiding a link.
 */
export async function getSponsorChildOrNotFound(sponsorId: string, childId: string) {
  const sponsorship = await prisma.sponsorship.findFirst({
    where: { sponsorId, childId, status: { in: ["ACTIVE", "PAUSED", "PAYMENT_ISSUE", "COMPLETED"] } },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });
  if (!sponsorship) notFound();
  return sponsorship;
}
