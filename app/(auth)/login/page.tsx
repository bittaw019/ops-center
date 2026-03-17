import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/server";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_40%),#020617] p-6">
      <div className="panel w-full max-w-md p-6">
        <p className="text-xs uppercase tracking-wide text-accent">Ops Center</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">Accesso al pannello operativo</h1>
        <p className="mt-1 text-sm text-slate-400">Gestisci siti, backup, log e operazioni server da una dashboard unica.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
