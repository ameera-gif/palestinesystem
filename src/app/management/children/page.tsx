import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateAge } from "@/lib/format";

export default async function ManagementChildrenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const where: Prisma.ChildWhereInput = {};
  if (status) where.status = status as Prisma.EnumChildStatusFilter["equals"];
  if (q) where.OR = [{ displayName: { contains: q } }, { childCode: { contains: q } }];

  const children = await prisma.child.findMany({
    where,
    include: { assignedUfukStaff: true, sponsorships: { where: { status: "ACTIVE" }, include: { sponsor: true } } },
    orderBy: { registeredAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Children</h1>

      <form className="flex flex-wrap gap-3 mb-6">
        <Input name="q" defaultValue={q} placeholder="Search name or ID…" className="w-56" />
        <Select name="status" defaultValue={status ?? ""} className="w-48">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ELIGIBLE">Eligible</option>
          <option value="AVAILABLE">Available</option>
          <option value="SPONSORED">Sponsored</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="EXITED">Exited</option>
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {children.length === 0 ? (
        <EmptyState title="No children found" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-3 font-medium">Child</th>
                <th className="p-3 font-medium">Age</th>
                <th className="p-3 font-medium">Ufuk staff</th>
                <th className="p-3 font-medium">Sponsor</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {children.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-brand-light/30">
                  <td className="p-3">
                    <Link href={`/management/children/${c.id}`} className="font-medium text-ink hover:text-brand">
                      {c.displayName} <span className="text-muted font-normal">({c.childCode})</span>
                    </Link>
                  </td>
                  <td className="p-3 text-muted">{calculateAge(c.dateOfBirth)}</td>
                  <td className="p-3 text-muted">{c.assignedUfukStaff?.name ?? "—"}</td>
                  <td className="p-3 text-muted">{c.sponsorships[0]?.sponsor.displayName ?? "—"}</td>
                  <td className="p-3">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
