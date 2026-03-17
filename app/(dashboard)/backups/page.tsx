import { Card } from "@/components/ui/card";
import { BackupCreateForm } from "@/components/backups/backup-create-form";
import { listBackups } from "@/lib/services/backup-service";
import { listSites } from "@/lib/services/site-service";
import { formatDate } from "@/lib/utils";

export default async function BackupsPage() {
  const [backups, sites] = await Promise.all([listBackups(), listSites()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Backup Center</h1>
        <p className="text-sm text-slate-400">Backup manuali, storico esiti e struttura pronta per scheduling.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {sites.map((site) => (
          <Card key={site.id} className="space-y-2">
            <p className="text-sm font-semibold">{site.name}</p>
            <p className="text-xs text-slate-500">{site.domain}</p>
            <BackupCreateForm siteId={site.id} />
          </Card>
        ))}
      </section>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Sito</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Stato</th>
              <th className="px-4 py-3">Storage</th>
              <th className="px-4 py-3">Messaggio</th>
              <th className="px-4 py-3">Quando</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup) => (
              <tr key={backup.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{backup.site.name}</td>
                <td className="px-4 py-3">{backup.type}</td>
                <td className="px-4 py-3">{backup.status}</td>
                <td className="px-4 py-3 text-xs">{backup.storagePath ?? "-"}</td>
                <td className="px-4 py-3">{backup.message ?? "-"}</td>
                <td className="px-4 py-3">{formatDate(backup.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
