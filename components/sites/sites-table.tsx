"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SiteRow = {
  id: string;
  name: string;
  domain: string;
  provider: "GENERIC" | "PLESK";
  environment: string;
  connectionStatus: "OK" | "FAILED" | "UNKNOWN";
  lastBackupAt: string | null;
  tags: Array<{ id: string; name: string; color: string }>;
};

function fmtDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("it-IT");
}

function envLabel(env: string) {
  if (env === "PROD") return "Produzione";
  if (env === "STAGING") return "Staging";
  return "Sviluppo";
}

export function SitesTable({ sites }: { sites: SiteRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | "OK" | "FAILED" | "UNKNOWN">("ALL");

  const filtered = useMemo(() => {
    return sites.filter((site) => {
      const matchesQuery = !query.trim() || `${site.name} ${site.domain}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" || site.connectionStatus === status;
      return matchesQuery && matchesStatus;
    });
  }, [sites, query, status]);

  return (
    <div className="space-y-3 p-4">
      <div className="grid gap-2 md:grid-cols-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca per nome o dominio" />
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="ALL">Tutti gli stati</option>
          <option value="OK">Solo OK</option>
          <option value="FAILED">Solo FAILED</option>
          <option value="UNKNOWN">Solo UNKNOWN</option>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Sito</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Ambiente</th>
              <th className="px-4 py-3">Connessione</th>
              <th className="px-4 py-3">Ultimo backup</th>
              <th className="px-4 py-3">Tag</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((site) => (
              <tr key={site.id} className="border-t border-slate-800 hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <Link href={`/sites/${site.id}`} className="font-medium text-accent hover:underline">{site.name}</Link>
                  <p className="text-xs text-slate-500">{site.domain}</p>
                </td>
                <td className="px-4 py-3">{site.provider === "PLESK" ? "Plesk" : "Generico"}</td>
                <td className="px-4 py-3">{envLabel(site.environment)}</td>
                <td className="px-4 py-3">
                  <Badge variant={site.connectionStatus === "OK" ? "success" : site.connectionStatus === "FAILED" ? "error" : "warning"}>
                    {site.connectionStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">{fmtDate(site.lastBackupAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {site.tags.length === 0 ? <span className="text-xs text-slate-500">-</span> : null}
                    {site.tags.map((tag) => (
                      <span key={tag.id} className="rounded-full border border-slate-700 px-2 py-0.5 text-xs" style={{ borderColor: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? <p className="text-sm text-slate-500">Nessun sito con questi filtri.</p> : null}
    </div>
  );
}
