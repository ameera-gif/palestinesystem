import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ChildForm } from "./child-form";

export default async function NewChildPage() {
  const session = await auth();
  const isUfuk = session!.user.role === "UFUK";

  // A Ufuk field officer registering a child is, by definition, the person
  // responsible for it — the form locks assignment to them rather than
  // offering a dropdown of colleagues (see ChildForm / createChildAction for
  // the server-side enforcement of this). A PC or Admin registering a child
  // on Ufuk's behalf isn't field staff themselves, so they still pick who's
  // responsible.
  const ufukStaff = isUfuk ? [] : await prisma.ufukStaff.findMany({ select: { id: true, name: true } });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink mb-1">Register a New Child</h1>
      <p className="text-sm text-muted mb-6">
        The child starts as <span className="font-medium">Draft</span> until eligibility screening is complete.
      </p>
      <Card>
        <CardContent className="pt-6">
          <ChildForm ufukStaff={ufukStaff} selfAssign={isUfuk ? { id: session!.user.profileId!, name: session!.user.name! } : null} />
        </CardContent>
      </Card>
    </div>
  );
}
