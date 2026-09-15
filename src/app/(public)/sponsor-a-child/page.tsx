import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toPublicChildCard } from "@/lib/mappers/child";
import { ChildCard } from "@/components/public/child-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sponsor a Child | MyFundAction" };

const REGIONS = ["Gaza City", "Khan Younis", "Rafah", "Deir al-Balah", "Jabalia", "Beit Lahia", "Nuseirat"];

export default async function SponsorAChildPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; gender?: string; status?: string }>;
}) {
  const { region, gender, status } = await searchParams;

  const where: Prisma.ChildWhereInput = {
    status: status === "sponsored" ? "SPONSORED" : status === "available" ? "AVAILABLE" : { in: ["AVAILABLE", "SPONSORED"] },
  };
  if (region) where.region = region;
  if (gender === "MALE" || gender === "FEMALE") where.gender = gender;

  const children = await prisma.child.findMany({
    where,
    orderBy: [{ status: "asc" }, { registeredAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">Sponsor a Child</h1>
        <p className="mt-3 text-muted">
          Every child below has been registered by our field partner and reviewed by MyFundAction. Choose a
          child to sponsor, and you&rsquo;ll receive verified updates throughout your sponsorship.
        </p>
      </div>

      <form className="mt-8 flex flex-wrap gap-3 items-end bg-surface border border-border rounded-xl p-4">
        <div className="w-40">
          <label className="block text-xs font-medium text-muted mb-1">Region</label>
          <Select name="region" defaultValue={region ?? ""}>
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-36">
          <label className="block text-xs font-medium text-muted mb-1">Gender</label>
          <Select name="gender" defaultValue={gender ?? ""}>
            <option value="">Any</option>
            <option value="MALE">Boy</option>
            <option value="FEMALE">Girl</option>
          </Select>
        </div>
        <div className="w-44">
          <label className="block text-xs font-medium text-muted mb-1">Sponsorship status</label>
          <Select name="status" defaultValue={status ?? ""}>
            <option value="">All children</option>
            <option value="available">Available only</option>
            <option value="sponsored">Already sponsored</option>
          </Select>
        </div>
        <Button type="submit" variant="secondary" size="md">
          Apply Filters
        </Button>
        {(region || gender || status) && (
          <Button href="/sponsor-a-child" variant="ghost" size="md">
            Clear
          </Button>
        )}
      </form>

      <p className="mt-6 text-sm text-muted">{children.length} children found</p>

      {children.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No children match these filters" description="Try clearing a filter to see more children." />
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <ChildCard key={child.id} child={toPublicChildCard(child)} />
          ))}
        </div>
      )}
    </div>
  );
}
