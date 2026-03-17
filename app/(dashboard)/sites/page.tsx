import { Card } from "@/components/ui/card";
import { SiteForm } from "@/components/sites/site-form";
import { SitesTable } from "@/components/sites/sites-table";
import { listSites } from "@/lib/services/site-service";

export default async function SitesPage() {
  const sites = await listSites();

  const tableData = sites.map((site) => ({
    id: site.id,
    name: site.name,
    domain: site.domain,
    provider: site.provider,
    environment: site.environment,
    connectionStatus: site.connectionStatus,
    lastBackupAt: site.backups[0]?.createdAt?.toISOString() ?? null,
    tags: site.tags.map(({ tag }) => ({ id: tag.id, name: tag.name, color: tag.color }))
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Siti gestiti</h1>
        <p className="text-sm text-slate-400">Vista rapida siti e configurazione guidata nuova aggiunta.</p>
      </div>

      <Card className="p-0">
        <SitesTable sites={tableData} />
      </Card>

      <Card>
        <SiteForm />
      </Card>
    </div>
  );
}
