import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSponsorChildOrNotFound } from "@/lib/services/sponsor-access";
import { ChildTabs } from "@/components/portal/child-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export default async function SponsorChildMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const sponsorship = await getSponsorChildOrNotFound(session!.user.profileId!, id);

  // Sponsor sees SPONSOR_ONLY and PUBLIC_APPROVED media, only once approved —
  // never INTERNAL or still-PENDING items.
  const media = await prisma.media.findMany({
    where: {
      childId: id,
      approvalStatus: "APPROVED",
      visibility: { in: ["SPONSOR_ONLY", "PUBLIC_APPROVED"] },
    },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">{sponsorship.child.displayName}</h1>
      <ChildTabs childId={id} />

      {media.length === 0 ? (
        <EmptyState title="No approved photos or videos yet" description="Approved updates from Ufuk will appear here once MyFundAction reviews them." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((m) => (
            <div key={m.id} className="rounded-xl overflow-hidden border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.fileUrl} alt="" className="aspect-4/3 w-full object-cover" />
              <div className="p-3">
                {m.description && <p className="text-sm text-ink">{m.description}</p>}
                <p className="text-xs text-muted mt-1">{formatDate(m.uploadedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
