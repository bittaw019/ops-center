import { Card } from "@/components/ui/card";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { requireUser } from "@/lib/auth/server";
import { getUserProfileOverview } from "@/lib/services/user-service";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const authUser = await requireUser();
  const overview = await getUserProfileOverview(authUser.id);

  if (!overview) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Profilo utente</h1>
        <Card>
          <p className="text-sm text-rose-300">Impossibile caricare dettagli profilo.</p>
        </Card>
      </div>
    );
  }

  const { user, stats } = overview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profilo utente</h1>
        <p className="text-sm text-slate-400">Gestisci dati account, preferenze e sicurezza.</p>
      </div>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Dettagli account</h2>
        <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
          <p><span className="text-slate-400">ID utente:</span> {user.id}</p>
          <p><span className="text-slate-400">Nome:</span> {user.name}</p>
          <p><span className="text-slate-400">Email:</span> {user.email}</p>
          <p><span className="text-slate-400">Ruolo:</span> {user.role}</p>
          <p><span className="text-slate-400">Stato:</span> {user.isActive ? "Attivo" : "Disattivo"}</p>
          <p><span className="text-slate-400">Creato il:</span> {formatDate(user.createdAt)}</p>
          <p><span className="text-slate-400">Ultimo aggiornamento:</span> {formatDate(user.updatedAt)}</p>
          <p><span className="text-slate-400">Ultimo login:</span> {formatDate(stats.lastLoginAt)}</p>
          <p><span className="text-slate-400">Azioni ultimi 30 giorni:</span> {stats.actionsLast30Days}</p>
          <p><span className="text-slate-400">Notifiche non lette:</span> {stats.unreadNotifications}</p>
          <p><span className="text-slate-400">Timezone:</span> {user.profile?.timezone ?? "-"}</p>
          <p><span className="text-slate-400">Locale:</span> {user.profile?.locale ?? "-"}</p>
          <p><span className="text-slate-400">Tema:</span> {user.profile?.theme ?? "dark"}</p>
          <p><span className="text-slate-400">Email alert:</span> {user.profile?.receiveEmails ? "Attive" : "Disattive"}</p>
        </div>
      </Card>

      <ProfileSettingsForm
        initial={{
          name: user.name,
          email: user.email,
          timezone: user.profile?.timezone ?? "Europe/Rome",
          locale: user.profile?.locale ?? "it-IT",
          theme: user.profile?.theme === "light" ? "light" : "dark",
          receiveEmails: Boolean(user.profile?.receiveEmails)
        }}
      />
    </div>
  );
}
