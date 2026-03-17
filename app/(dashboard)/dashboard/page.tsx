import Link from "next/link";
import { AlertTriangle, CheckCircle2, Globe, ServerCrash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { UptimeChart } from "@/components/dashboard/uptime-chart";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard generale</h1>
        <p className="text-sm text-slate-400">Overview operativa siti, backup, alert e storico eventi.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Siti attivi</p>
            <Globe className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{data.metrics.activeSites}</p>
          <p className="mt-1 text-xs text-slate-500">Totale registrati: {data.metrics.sitesTotal}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Connessioni fallite</p>
            <ServerCrash className="h-4 w-4 text-rose-300" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{data.metrics.failedConnections}</p>
          <p className="mt-1 text-xs text-slate-500">Ultimi check connessione</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Errori 24h</p>
            <AlertTriangle className="h-4 w-4 text-amber-300" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{data.metrics.recentErrors}</p>
          <p className="mt-1 text-xs text-slate-500">Eventi severity ERROR/CRITICAL</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Backup recenti</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{data.latestBackups.length}</p>
          <p className="mt-1 text-xs text-slate-500">Ultimo: {formatDate(data.latestBackups[0]?.createdAt)}</p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-slate-200">Health Summary</h2>
          <p className="mb-4 text-xs text-slate-500">Trend stato siti negli ultimi eventi</p>
          <UptimeChart sites={data.sites.map((site) => ({ name: site.name, healthy: site.healthChecks[0]?.isHealthy ?? false }))} />
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Azioni rapide</h2>
          </div>
          <div className="space-y-2 text-sm">
            <Link href="/sites" className="block rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">Gestisci siti</Link>
            <Link href="/backups" className="block rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">Lancia backup manuale</Link>
            <Link href="/logs" className="block rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">Apri log tecnici</Link>
            <Link href="/activity" className="block rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">Audit trail</Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-200">Eventi recenti</h2>
          <div className="space-y-2">
            {data.recentEvents.map((event) => (
              <div key={event.id} className="panel-muted p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-200">{event.action}</p>
                  <Badge variant={event.severity === "ERROR" || event.severity === "CRITICAL" ? "error" : "info"}>{event.severity}</Badge>
                </div>
                <p className="mt-1 text-slate-400">{event.message}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(event.createdAt)} - {event.site?.name ?? "System"}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-200">Ultimi backup</h2>
          <div className="space-y-2">
            {data.latestBackups.map((backup) => (
              <div key={backup.id} className="panel-muted p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-200">{backup.site.name}</p>
                  <Badge variant={backup.status === "SUCCESS" ? "success" : backup.status === "FAILED" ? "error" : "warning"}>{backup.status}</Badge>
                </div>
                <p className="mt-1 text-slate-400">Tipo: {backup.type} - Trigger: {backup.triggerSource}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(backup.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
