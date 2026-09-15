import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Stories & Updates — MyFundAction" };

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({ where: { publishedAt: { not: null } }, orderBy: { publishedAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">Stories & Updates</h1>
      <p className="mt-3 text-muted max-w-2xl">Approved stories from the programme, shared with dignity and consent.</p>

      {stories.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No stories published yet" />
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((s) => (
            <Link key={s.id} href={`/stories/${s.slug}`}>
              <Card className="overflow-hidden h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                {s.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.coverImageUrl} alt="" className="aspect-4/3 w-full object-cover" />
                )}
                <div className="p-5">
                  <p className="text-xs text-muted">{formatDate(s.publishedAt)}</p>
                  <h2 className="mt-1 font-semibold text-ink">{s.title}</h2>
                  <p className="mt-1.5 text-sm text-muted line-clamp-3">{s.excerpt}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
