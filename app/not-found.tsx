import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="panel max-w-md p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Pagina non trovata</h1>
        <p className="mt-2 text-sm text-slate-400">La risorsa richiesta non esiste o non hai i permessi per visualizzarla.</p>
        <Link href="/dashboard" className="mt-4 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
          Torna alla dashboard
        </Link>
      </div>
    </div>
  );
}
