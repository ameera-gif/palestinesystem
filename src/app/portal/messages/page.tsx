import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { MessageForm } from "./message-form";

export default async function SponsorMessagesPage() {
  const session = await auth();
  const sponsorId = session!.user.profileId!;

  const [sponsorships, messages] = await Promise.all([
    prisma.sponsorship.findMany({ where: { sponsorId, status: { in: ["ACTIVE", "PAUSED"] } }, include: { child: true } }),
    prisma.message.findMany({ where: { sponsorId }, include: { child: true }, orderBy: { submittedAt: "desc" } }),
  ]);

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-1">Messages</h1>
        <p className="text-sm text-muted mb-6">
          Send a moderated greeting — MyFundAction reviews every message before Ufuk delivers it, and any reply is
          reviewed the same way before it reaches you.
        </p>

        {messages.length === 0 ? (
          <EmptyState title="No messages yet" description="Send your first greeting using the form." />
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      {m.direction === "SPONSOR_TO_CHILD" ? `You → ${m.child.displayName}` : `${m.child.displayName} → You`}
                      {m.occasion && <span className="text-muted font-normal"> · {m.occasion}</span>}
                    </p>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-sm text-ink mt-2">{m.content}</p>
                  <p className="text-xs text-muted mt-2">{formatDate(m.submittedAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Send a message</CardTitle>
        </CardHeader>
        <CardContent>
          {sponsorships.length === 0 ? (
            <p className="text-sm text-muted">You need an active sponsorship to send a message.</p>
          ) : (
            <MessageForm children={sponsorships.map((s) => ({ id: s.childId, displayName: s.child.displayName }))} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
