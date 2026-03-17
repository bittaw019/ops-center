import { notFound } from "next/navigation";
import { FileManagerPanel } from "@/components/sites/file-manager-panel";
import { getSiteById } from "@/lib/services/site-service";

export default async function SiteFilesPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await getSiteById(siteId);
  if (!site) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">File Manager</h1>
        <p className="text-sm text-slate-400">{site.name} - {site.connection?.host}:{site.rootPath}</p>
      </div>
      <FileManagerPanel siteId={site.id} />
    </div>
  );
}
