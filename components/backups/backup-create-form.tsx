"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function BackupCreateForm({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [type, setType] = useState("FULL");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, type })
      });

      const data = await response.json().catch(() => null);
      setMessage(data?.message ?? (response.ok ? "Backup completato" : "Errore backup"));

      if (response.ok) {
        router.refresh();
      }
    } catch {
      setMessage("Errore di rete durante avvio backup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Select value={type} onChange={(event) => setType(event.target.value)} className="max-w-44">
        <option value="FULL">FULL</option>
        <option value="FILES">FILES</option>
        <option value="DATABASE">DATABASE</option>
      </Select>
      <Button onClick={submit} disabled={loading}>{loading ? "Esecuzione..." : "Avvia backup"}</Button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
