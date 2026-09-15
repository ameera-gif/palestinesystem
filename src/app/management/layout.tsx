import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/layout/portal-shell";

export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MYFUNDACTION_PC" && session.user.role !== "ADMIN")) redirect("/login");

  const unreadCount = await prisma.notification.count({ where: { userId: session.user.id, isRead: false } });
  const reviewQueueCount = await prisma.report.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } });

  return (
    <PortalShell
      portalLabel="MyFundAction Management"
      userName={session.user.name ?? "Project Coordinator"}
      unreadCount={unreadCount}
      navItems={[
        { href: "/management", label: "Dashboard" },
        { href: "/management/review", label: "Review Centre", badge: reviewQueueCount || undefined },
        { href: "/management/children", label: "Children" },
        { href: "/management/sponsors", label: "Sponsors" },
        { href: "/management/sponsorships", label: "Sponsorships" },
        { href: "/management/meetings", label: "Meetings" },
        { href: "/management/analytics", label: "Analytics" },
        { href: "/management/team", label: "Field Team" },
        { href: "/management/settings", label: "Programme Settings" },
        { href: "/management/notifications", label: "Notifications", badge: unreadCount || undefined },
      ]}
    >
      {children}
    </PortalShell>
  );
}
