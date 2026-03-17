import { prisma } from "@/lib/db/prisma";
import { logFilterSchema } from "@/lib/validation/schemas";

export async function listActivityLogs(input?: unknown) {
  const parsed = logFilterSchema.safeParse(input ?? {});

  const where = parsed.success
    ? {
        siteId: parsed.data.siteId,
        severity: parsed.data.severity,
        eventType: parsed.data.eventType,
        OR: parsed.data.query
          ? [
              { message: { contains: parsed.data.query, mode: "insensitive" as const } },
              { action: { contains: parsed.data.query, mode: "insensitive" as const } }
            ]
          : undefined
      }
    : undefined;

  return prisma.activityLog.findMany({
    where,
    include: { site: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 200
  });
}
