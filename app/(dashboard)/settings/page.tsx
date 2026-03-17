import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Impostazioni</h1>
        <p className="text-sm text-slate-400">Configurazioni globali, notifiche e predisposizione integrazioni esterne.</p>
      </div>

      <Card className="space-y-2">
        <h2 className="text-sm font-semibold">Sicurezza</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Session cookie HTTP-only, secure in produzione.</li>
          <li>Secret e credenziali cifrati in storage (hash placeholder).</li>
          <li>Boundary permessi via ruoli ADMIN/OPERATOR/READ_ONLY.</li>
          <li>Punto di estensione per rate limiting API gateway/middleware.</li>
        </ul>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-sm font-semibold">Scheduler backup</h2>
        <p className="text-sm text-slate-300">Architettura pronta per scheduler reale (cron/queue worker). Integrare job runner esterno invocando `runManualBackup` in modalita pianificata.</p>
      </Card>
    </div>
  );
}
