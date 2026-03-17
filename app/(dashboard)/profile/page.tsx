import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/server";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profilo utente</h1>
        <p className="text-sm text-slate-400">Informazioni account e preferenze personali.</p>
      </div>

      <Card className="space-y-2">
        <p><span className="text-slate-400">Nome:</span> {user.name}</p>
        <p><span className="text-slate-400">Email:</span> {user.email}</p>
        <p><span className="text-slate-400">Ruolo:</span> {user.role}</p>
        <p><span className="text-slate-400">Timezone:</span> {user.profile?.timezone ?? "-"}</p>
        <p><span className="text-slate-400">Tema:</span> {user.profile?.theme ?? "dark"}</p>
      </Card>
    </div>
  );
}
