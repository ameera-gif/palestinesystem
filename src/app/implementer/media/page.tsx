import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { MediaUploadForm } from "./media-form";

export default async function UfukMediaPage() {
  const session = await auth();
  const [children, media] = await Promise.all([
    prisma.child.findMany({ where: { status: { in: ["SPONSORED", "AVAILABLE"] } }, select: { id: true, displayName: true }, orderBy: { displayName: "asc" } }),
    prisma.media.findMany({ where: { uploadedById: session!.user.profileId! }, include: { child: true }, orderBy: { uploadedAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-6">Media</h1>
        {media.length === 0 ? (
          <EmptyState title="No media uploaded yet" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {media.map((m) => (
              <div key={m.id} className="rounded-xl overflow-hidden border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.fileUrl} alt="" className="aspect-4/3 w-full object-cover" />
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{m.child.displayName}</p>
                    <StatusBadge status={m.approvalStatus} />
                  </div>
                  <StatusBadge status={m.visibility} />
                  <p className="text-xs text-muted">{formatDate(m.uploadedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Upload media</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUploadForm children={children} />
        </CardContent>
      </Card>
    </div>
  );
}
