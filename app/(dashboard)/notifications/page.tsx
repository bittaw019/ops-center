import { Card } from "@/components/ui/card";
import { NotificationsCenter } from "@/components/notifications/notifications-center";
import { requireUser } from "@/lib/auth/server";
import { listNotifications } from "@/lib/services/notification-service";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await listNotifications(user.id);

  const initialData = notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifiche</h1>
        <p className="text-sm text-slate-400">Alert operativi, esiti backup e problemi connessione.</p>
      </div>

      <Card>
        <NotificationsCenter initialData={initialData} />
      </Card>
    </div>
  );
}
