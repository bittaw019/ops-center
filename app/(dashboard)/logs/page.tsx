import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listActivityLogs } from "@/lib/services/log-service";
import { formatDate } from "@/lib/utils";

export default async function LogsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const logs = await listActivityLogs({
    query: typeof params.query === "string" ? params.query : undefined,
    severity: typeof params.severity === "string" ? params.severity : undefined,
    eventType: typeof params.eventType === "string" ? params.eventType : undefined
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Logs tecnici</h1>
        <p className="text-sm text-slate-400">Filtra per severita, tipo evento e testo. Dati dal log operativo reale DB.</p>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Severita</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Sito</th>
              <th className="px-4 py-3">Utente</th>
              <th className="px-4 py-3">Messaggio</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-3"><Badge variant={log.severity === "ERROR" || log.severity === "CRITICAL" ? "error" : log.severity === "WARN" ? "warning" : "info"}>{log.severity}</Badge></td>
                <td className="px-4 py-3">{log.eventType}</td>
                <td className="px-4 py-3">{log.site?.name ?? "-"}</td>
                <td className="px-4 py-3">{log.user?.name ?? "System"}</td>
                <td className="px-4 py-3">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
