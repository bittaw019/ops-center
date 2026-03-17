"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="panel max-w-lg p-6">
      <h2 className="text-lg font-semibold">Errore operativo</h2>
      <p className="mt-2 text-sm text-slate-400">Si e' verificato un problema durante il caricamento del pannello.</p>
      <button onClick={() => reset()} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-slate-900">
        Riprova
      </button>
    </div>
  );
}
