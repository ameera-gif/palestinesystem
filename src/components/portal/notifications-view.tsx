import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { markAllNotificationsRead } from "@/lib/services/notification-actions";

export async function NotificationsView({ returnPath }: { returnPath: string }) {
  const session = await auth();
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <form action={markAllNotificationsRead.bind(null, returnPath)}>
            <button type="submit" className="text-sm font-medium text-brand">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const content = (
              <Card className={cn("p-4", !n.isRead && "border-brand bg-brand-light/40")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <p className="text-sm text-muted mt-0.5">{n.body}</p>
                  </div>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                </div>
                <p className="text-xs text-muted mt-2">{formatDateTime(n.createdAt)}</p>
              </Card>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
