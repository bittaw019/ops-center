import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/services/notification-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await listNotifications(user.id);
    return NextResponse.json({ data: notifications });
  } catch {
    return NextResponse.json({ message: "Errore caricamento notifiche" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const notificationId = typeof body.notificationId === "string" ? body.notificationId : undefined;

    if (notificationId === "all") {
      await markAllNotificationsRead(user.id);
      return NextResponse.json({ ok: true });
    }

    if (!notificationId) {
      return NextResponse.json({ message: "notificationId obbligatorio" }, { status: 400 });
    }

    const updated = await markNotificationRead(notificationId, user.id);
    if (updated.count === 0) {
      return NextResponse.json({ message: "Notifica non trovata" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Errore aggiornamento notifica" }, { status: 500 });
  }
}
