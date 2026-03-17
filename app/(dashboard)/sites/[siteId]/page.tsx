import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConnectionTestButton } from "@/components/sites/connection-test-button";
import { SiteEditActions } from "@/components/sites/site-edit-actions";
import { getSiteById } from "@/lib/services/site-service";
import { formatDate } from "@/lib/utils";

export default async function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await getSiteById(siteId);

  if (!site) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{site.name}</h1>
          <p className="text-sm text-slate-400">{site.domain} - {site.environment} - {site.provider}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/sites/${site.id}/files`} className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">Apri file manager</Link>
          <ConnectionTestButton siteId={site.id} />
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold">Configurazione sito</h2>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <p><span className="text-slate-400">Provider:</span> {site.provider}</p>
            <p><span className="text-slate-400">Root path:</span> {site.rootPath}</p>
            <p><span className="text-slate-400">Connessione:</span> <Badge variant={site.connectionStatus === "OK" ? "success" : site.connectionStatus === "FAILED" ? "error" : "warning"}>{site.connectionStatus}</Badge></p>
            <p><span className="text-slate-400">Host:</span> {site.connection?.host ?? "-"}</p>
            <p><span className="text-slate-400">Porta:</span> {site.connection?.port ?? "-"}</p>
            <p><span className="text-slate-400">Username:</span> {site.connection?.username ?? "-"}</p>
            <p><span className="text-slate-400">Plesk URL:</span> {site.connection?.pleskBaseUrl ?? "-"}</p>
            <p><span className="text-slate-400">Ultimo test:</span> {formatDate(site.connection?.lastTestedAt)}</p>
          </div>
          <p className="text-sm text-slate-300"><span className="text-slate-400">Note:</span> {site.notes ?? "Nessuna nota"}</p>
        </Card>

        <Card>
          <h2 className="mb-2 text-sm font-semibold">Health summary</h2>
          <p className="text-sm text-slate-400">Ultimo accesso: {formatDate(site.lastSeenAt)}</p>
          <p className="text-sm text-slate-400">Ultima sync: {formatDate(site.lastSyncAt)}</p>
          <p className="text-sm text-slate-400">Ultimo backup: {formatDate(site.backups[0]?.createdAt)}</p>
          <p className="mt-2 text-sm">
            <Badge variant={(site.healthChecks[0]?.isHealthy ?? false) ? "success" : "error"}>
              {(site.healthChecks[0]?.isHealthy ?? false) ? "Healthy" : "Issue detected"}
            </Badge>
          </p>
        </Card>
      </section>

      <Card>
        <SiteEditActions
          siteId={site.id}
          initial={{
            name: site.name,
            domain: site.domain,
            provider: site.provider,
            environment: site.environment,
            rootPath: site.rootPath,
            notes: site.notes,
            databaseBackupCommand: site.databaseBackupCommand,
            connection: site.connection
              ? {
                  host: site.connection.host,
                  port: site.connection.port,
                  username: site.connection.username,
                  authType: site.connection.authType as "password" | "ssh_key",
                  pleskBaseUrl: site.connection.pleskBaseUrl,
                  pleskSubscriptionId: site.connection.pleskSubscriptionId
                }
              : null
          }}
        />
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Checklist manutenzione</h2>
          <div className="space-y-2 text-sm">
            {site.maintenanceChecks.map((check) => (
              <div key={check.id} className="panel-muted p-2">
                <p className="font-medium">{check.title}</p>
                <p className="text-xs text-slate-500">{check.isDone ? "Completata" : "In attesa"} - due {formatDate(check.dueAt)}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Cronologia release</h2>
          <div className="space-y-2 text-sm">
            {site.releases.map((release) => (
              <div key={release.id} className="panel-muted p-2">
                <p className="font-medium">{release.version} - {release.title}</p>
                <p className="text-xs text-slate-500">{release.notes}</p>
                <p className="text-xs text-slate-600">{formatDate(release.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
