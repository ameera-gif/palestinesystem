import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export default async function ManagementSponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({
    include: { sponsorships: { include: { child: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Sponsors</h1>
      {sponsors.length === 0 ? (
        <EmptyState title="No sponsors yet" />
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {sponsors.map((s) => {
              const flags = s.sponsorships.some((x) => x.status === "PAYMENT_ISSUE")
                ? "danger"
                : s.sponsorships.some((x) => x.status === "PAUSED")
                  ? "warning"
                  : null;
              return (
                <Link
                  key={s.id}
                  href={`/management/sponsors/${s.id}`}
                  className="block rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink">{s.displayName}</p>
                    {flags && <StatusPillInline tone={flags} />}
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {s.country ?? "—"} · {s.sponsorships.filter((x) => x.status === "ACTIVE").length} active
                    {s.sponsorships.length > 1 && ` (${s.sponsorships.length} total)`}
                  </p>
                  <p className="text-xs text-muted mt-1">Joined {formatDate(s.createdAt)}</p>
                </Link>
              );
            })}
          </div>

          <Card className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="p-3 font-medium">Sponsor</th>
                  <th className="p-3 font-medium">Country</th>
                  <th className="p-3 font-medium">Children sponsored</th>
                  <th className="p-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((s) => {
                  const flags = s.sponsorships.some((x) => x.status === "PAYMENT_ISSUE")
                    ? "danger"
                    : s.sponsorships.some((x) => x.status === "PAUSED")
                      ? "warning"
                      : null;
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-brand-light/30">
                      <td className="p-3">
                        <Link href={`/management/sponsors/${s.id}`} className="font-medium text-ink hover:text-brand">
                          {s.displayName}
                        </Link>
                        {flags && <StatusPillInline tone={flags} />}
                      </td>
                      <td className="p-3 text-muted">{s.country ?? "—"}</td>
                      <td className="p-3 text-muted">
                        {s.sponsorships.filter((x) => x.status === "ACTIVE").length} active
                        {s.sponsorships.length > 1 && ` (${s.sponsorships.length} total)`}
                      </td>
                      <td className="p-3 text-muted">{formatDate(s.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusPillInline({ tone }: { tone: "danger" | "warning" }) {
  return (
    <span className="ml-2 inline-block">
      <StatusBadge status={tone === "danger" ? "PAYMENT_ISSUE" : "PAUSED"} />
    </span>
  );
}
