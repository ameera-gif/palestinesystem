import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { CreateUfukForm } from "./create-ufuk-form";
import { toggleUfukStaffActiveAction } from "./actions";

export default async function ManagementTeamPage() {
  const staff = await prisma.ufukStaff.findMany({
    include: {
      user: true,
      _count: { select: { assignedChildren: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-1">Ufuk Field Team</h1>
        <p className="text-sm text-muted mb-6">
          Manage the field staff accounts working on the programme. Creating or deactivating a MyFundAction
          Project Coordinator or Admin account still requires an Admin — this page is scoped to Ufuk staff only.
        </p>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Children assigned</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium text-ink">{s.name}</td>
                  <td className="p-3 text-muted">{s.user.email}</td>
                  <td className="p-3 text-muted">{s._count.assignedChildren}</td>
                  <td className="p-3 text-muted">{formatDate(s.createdAt)}</td>
                  <td className="p-3">
                    <StatusPill label={s.user.isActive ? "Active" : "Deactivated"} tone={s.user.isActive ? "success" : "neutral"} />
                  </td>
                  <td className="p-3">
                    <form action={toggleUfukStaffActiveAction.bind(null, s.userId, !s.user.isActive)}>
                      <Button type="submit" size="sm" variant="ghost">
                        {s.user.isActive ? "Deactivate" : "Activate"}
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
          <CardTitle>Add a field officer</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUfukForm />
        </CardContent>
      </Card>
    </div>
  );
}
