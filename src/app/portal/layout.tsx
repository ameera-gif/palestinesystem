import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/layout/portal-shell";

export default async function SponsorPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SPONSOR") redirect("/login");

  const unreadCount = await prisma.notification.count({ where: { userId: session.user.id, isRead: false } });

  return (
    <PortalShell
      portalLabel="Sponsor Portal"
      userName={session.user.name ?? "Sponsor"}
      unreadCount={unreadCount}
      navItems={[
        { href: "/portal", label: "My Sponsorships" },
        { href: "/portal/sponsorship", label: "Contributions" },
        { href: "/portal/meetings", label: "Meetings" },
        { href: "/portal/messages", label: "Messages" },
        { href: "/portal/notifications", label: "Notifications", badge: unreadCount || undefined },
      ]}
    >
      {children}
    </PortalShell>
  );
}
