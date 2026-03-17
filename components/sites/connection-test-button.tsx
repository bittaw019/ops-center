"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ConnectionTestButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleTest() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/sites/${siteId}/connection-test`, { method: "POST" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.message ?? "Test connessione fallito");
        return;
      }

      setMessage(data?.result?.message ?? "Test completato");
      router.refresh();
    } catch {
      setMessage("Errore di rete durante test connessione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleTest} disabled={loading}>{loading ? "Testing..." : "Test connessione"}</Button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
