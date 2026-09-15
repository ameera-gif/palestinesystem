import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateAge } from "@/lib/format";

export default async function UfukChildrenPage({
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
    include: { assignedUfukStaff: true },
    orderBy: { registeredAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-ink">Children</h1>
        <Button href="/implementer/children/new" size="sm">
          + Register New Child
        </Button>
      </div>

      <form className="flex flex-wrap gap-3 mb-6">
        <Input name="q" defaultValue={q} placeholder="Search name or ID…" className="w-56" />
        <Select name="status" defaultValue={status ?? ""} className="w-48">
          <option value="">All statuses</option>
          <option value="ELIGIBLE">Eligible</option>
          <option value="AVAILABLE">Available</option>
          <option value="SPONSORED">Sponsored</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="EXITED">Exited</option>
          <option value="DRAFT">Draft</option>
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
                <th className="p-3 font-medium">Region</th>
                <th className="p-3 font-medium">Assigned to</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {children.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-brand-light/30">
                  <td className="p-3">
                    <Link href={`/implementer/children/${c.id}`} className="font-medium text-ink hover:text-brand">
                      {c.displayName} <span className="text-muted font-normal">({c.childCode})</span>
                    </Link>
                  </td>
                  <td className="p-3 text-muted">{calculateAge(c.dateOfBirth)}</td>
                  <td className="p-3 text-muted">{c.region}</td>
                  <td className="p-3 text-muted">{c.assignedUfukStaff?.name ?? "—"}</td>
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
