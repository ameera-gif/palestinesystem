import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/layout/portal-shell";

export default async function ImplementerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "UFUK") redirect("/login");

  const unreadCount = await prisma.notification.count({ where: { userId: session.user.id, isRead: false } });

  return (
    <PortalShell
      portalLabel="Field Partner Portal"
      userName={session.user.name ?? "Field Team"}
      unreadCount={unreadCount}
      navItems={[
        { href: "/implementer", label: "Dashboard" },
        { href: "/implementer/children", label: "Children" },
        { href: "/implementer/reports", label: "Reports" },
        { href: "/implementer/distributions", label: "Distributions" },
        { href: "/implementer/media", label: "Media" },
        { href: "/implementer/meetings", label: "Meetings" },
        { href: "/implementer/notifications", label: "Notifications", badge: unreadCount || undefined },
      ]}
    >
      {children}
    </PortalShell>
  );
}
