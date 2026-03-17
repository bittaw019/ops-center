"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  createdAt: string;
};

export function NotificationsCenter({ initialData }: { initialData: NotificationItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function markRead(notificationId: string) {
    setLoadingId(notificationId);
    setMessage(null);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(data?.message ?? "Errore aggiornamento notifica");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Errore rete durante aggiornamento notifica");
    } finally {
      setLoadingId(null);
    }
  }

  async function markAllRead() {
    setLoadingId("all");
    setMessage(null);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: "all" })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(data?.message ?? "Errore aggiornamento notifiche");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Errore rete durante aggiornamento notifiche");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Totale notifiche: {initialData.length}</p>
        <Button variant="secondary" onClick={markAllRead} disabled={loadingId !== null}>
          {loadingId === "all" ? "Aggiornamento..." : "Segna tutte come lette"}
        </Button>
      </div>

      <div className="space-y-2">
        {initialData.length === 0 ? <p className="text-sm text-slate-500">Nessuna notifica.</p> : null}
        {initialData.map((notification) => (
          <div key={notification.id} className="panel space-y-2 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-200">{notification.title}</p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300">{notification.type}</span>
                <span className="text-xs text-slate-500">{notification.isRead ? "Letta" : "Non letta"}</span>
              </div>
            </div>
            <p className="text-sm text-slate-300">{notification.body}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString("it-IT")}</p>
              {!notification.isRead ? (
                <Button variant="secondary" onClick={() => markRead(notification.id)} disabled={loadingId !== null}>
                  {loadingId === notification.id ? "Salvataggio..." : "Segna letta"}
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {message ? <p className="text-sm text-rose-300">{message}</p> : null}
    </div>
  );
}
