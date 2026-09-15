import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDate } from "@/lib/format";
import { CreateUserForm } from "./create-user-form";
import { toggleUserActiveAction } from "./actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-1">Users & Roles</h1>
        <p className="text-sm text-muted mb-6">
          All accounts, across every role. For everyday field-staff onboarding, MyFundAction PCs can create and
          deactivate those accounts directly from{" "}
          <a href="/management/team" className="text-accent font-medium">
            Field Team
          </a>{" "}
          without needing Admin. This page is for PC/Admin account provisioning and full account oversight.
        </p>
        <div className="sm:hidden space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{u.name}</p>
                  <p className="text-sm text-muted mt-0.5 break-all">{u.email}</p>
                </div>
                <StatusPill label={u.isActive ? "Active" : "Deactivated"} tone={u.isActive ? "success" : "neutral"} />
              </div>
              <p className="text-sm text-muted mt-2">
                {ROLE_LABELS[u.role]} · Joined {formatDate(u.createdAt)}
              </p>
              <form action={toggleUserActiveAction.bind(null, u.id, !u.isActive)} className="mt-3">
                <Button type="submit" size="sm" variant="outline">
                  {u.isActive ? "Deactivate" : "Activate"}
                </Button>
              </form>
            </Card>
          ))}
        </div>

        <Card className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium text-ink">{u.name}</td>
                  <td className="p-3 text-muted">{u.email}</td>
                  <td className="p-3 text-muted">{ROLE_LABELS[u.role]}</td>
                  <td className="p-3 text-muted">{formatDate(u.createdAt)}</td>
                  <td className="p-3">
                    <StatusPill label={u.isActive ? "Active" : "Deactivated"} tone={u.isActive ? "success" : "neutral"} />
                  </td>
                  <td className="p-3">
                    <form action={toggleUserActiveAction.bind(null, u.id, !u.isActive)}>
                      <Button type="submit" size="sm" variant="ghost">
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Create staff account</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>
    </div>
  );
}
