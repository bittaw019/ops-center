import { Card } from "@/components/ui/card";
import { listActivityLogs } from "@/lib/services/log-service";
import { formatDate } from "@/lib/utils";

export default async function ActivityPage() {
  const logs = await listActivityLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attivita e Audit</h1>
        <p className="text-sm text-slate-400">Storico completo azioni utente e operazioni critiche.</p>
      </div>

      <div className="space-y-2">
        {logs.slice(0, 60).map((log) => (
          <Card key={log.id} className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{log.action}</p>
              <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
            </div>
            <p className="text-sm text-slate-300">{log.message}</p>
            <p className="text-xs text-slate-500">{log.user?.name ?? "System"} - {log.site?.name ?? "global"} - {log.severity}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
