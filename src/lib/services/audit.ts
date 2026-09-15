import { prisma } from "@/lib/prisma";

export async function recordAudit(params: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      summary: params.summary,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
