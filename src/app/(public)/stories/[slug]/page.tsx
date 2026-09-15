import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await prisma.story.findUnique({ where: { slug } });
  if (!story || !story.publishedAt) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      {story.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={story.coverImageUrl} alt="" className="w-full aspect-4/3 sm:aspect-[16/7] object-cover rounded-xl mb-8" />
      )}
      <p className="text-sm text-muted">{formatDate(story.publishedAt)}</p>
      <h1 className="mt-1 font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">{story.title}</h1>
      <p className="mt-4 text-ink leading-relaxed">{story.body}</p>
      <div className="mt-10">
        <Button href="/sponsor-a-child">Sponsor a Child</Button>
      </div>
    </article>
  );
}
