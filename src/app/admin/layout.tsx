import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/layout/portal-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const unreadCount = await prisma.notification.count({ where: { userId: session.user.id, isRead: false } });

  return (
    <PortalShell
      portalLabel="System Administration"
      userName={session.user.name ?? "Admin"}
      unreadCount={unreadCount}
      navItems={[
        { href: "/admin/users", label: "Users & Roles" },
        { href: "/admin/settings", label: "Programme Settings" },
        { href: "/management", label: "Management View →" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
