import { prisma } from "@/lib/db/prisma";

export async function getDashboardData() {
  const [
    sitesTotal,
    activeSites,
    failedConnections,
    recentErrors,
    recentEvents,
    latestBackups,
    sites
  ] = await Promise.all([
    prisma.site.count(),
    prisma.site.count({ where: { isArchived: false } }),
    prisma.site.count({ where: { connectionStatus: "FAILED", isArchived: false } }),
    prisma.activityLog.count({
      where: {
        severity: { in: ["ERROR", "CRITICAL"] },
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }
      }
    }),
    prisma.activityLog.findMany({
      include: { user: true, site: true },
      orderBy: { createdAt: "desc" },
      take: 12
    }),
    prisma.backup.findMany({
      include: { site: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.site.findMany({
      include: {
        backups: { take: 1, orderBy: { createdAt: "desc" } },
        healthChecks: { take: 1, orderBy: { checkedAt: "desc" } }
      },
      where: { isArchived: false },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return {
    metrics: { sitesTotal, activeSites, failedConnections, recentErrors },
    recentEvents,
    latestBackups,
    sites
  };
}
