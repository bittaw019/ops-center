import { prisma } from "@/lib/db/prisma";

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({
    where: {
      isRead: false,
      OR: [{ userId }, { userId: null }]
    }
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, OR: [{ userId }, { userId: null }] },
    data: { isRead: true }
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      isRead: false,
      OR: [{ userId }, { userId: null }]
    },
    data: { isRead: true }
  });
}
