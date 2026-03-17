"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SiteFormState = {
  name: string;
  domain: string;
  provider: "GENERIC" | "PLESK";
  environment: "PROD" | "STAGING" | "DEV";
  rootPath: string;
  notes: string;
  databaseBackupCommand: string;
  host: string;
  port: number;
  username: string;
  authType: "password" | "ssh_key";
  secret: string;
  sshKey: string;
  passphraseHint: string;
  pleskBaseUrl: string;
  pleskApiToken: string;
  pleskSubscriptionId: string;
};

const initialForm: SiteFormState = {
  name: "",
  domain: "",
  provider: "GENERIC",
  environment: "PROD",
  rootPath: "",
  notes: "",
  databaseBackupCommand: "",
  host: "",
  port: 22,
  username: "",
  authType: "password",
  secret: "",
  sshKey: "",
  passphraseHint: "",
  pleskBaseUrl: "",
  pleskApiToken: "",
  pleskSubscriptionId: ""
};

const ENV_HINT: Record<SiteFormState["environment"], string> = {
  PROD: "Produzione: sito live visibile agli utenti.",
  STAGING: "Staging: ambiente di pre-rilascio per test.",
  DEV: "Sviluppo: ambiente tecnico interno."
};

export function SiteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<SiteFormState>(initialForm);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...form,
        notes: form.notes || null,
        databaseBackupCommand: form.databaseBackupCommand || null,
        sshKey: form.sshKey || null,
        passphraseHint: form.passphraseHint || null,
        pleskBaseUrl: form.pleskBaseUrl || null,
        pleskApiToken: form.pleskApiToken || null,
        pleskSubscriptionId: form.pleskSubscriptionId || null
      };

      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "Errore creazione sito");
        return;
      }

      setForm(initialForm);
      setSuccess("Sito aggiunto correttamente");
      router.refresh();
    } catch {
      setError("Errore di rete durante creazione sito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-5 p-5">
      <div>
        <h3 className="text-base font-semibold text-slate-100">Aggiungi nuovo sito</h3>
        <p className="text-xs text-slate-400">Compila i dati principali, poi configura accesso server e provider.</p>
      </div>

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Identita sito</p>
        <div className="grid gap-2 md:grid-cols-2">
          <Input placeholder="Nome sito (es. Ecommerce IT)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="Dominio (es. www.example.com)" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value as SiteFormState["environment"] })}>
            <option value="PROD">Produzione (PROD)</option>
            <option value="STAGING">Staging (STAGING)</option>
            <option value="DEV">Sviluppo (DEV)</option>
          </Select>
          <Select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value as SiteFormState["provider"] })}>
            <option value="GENERIC">Server generico (SSH/SFTP)</option>
            <option value="PLESK">Plesk</option>
          </Select>
        </div>
        <p className="text-xs text-slate-500">{ENV_HINT[form.environment]}</p>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Percorsi e backup</p>
        <Input placeholder="Root path remoto (es. /var/www/vhosts/domain/httpdocs)" value={form.rootPath} onChange={(e) => setForm({ ...form, rootPath: e.target.value })} required />
        <Input
          placeholder="Comando backup DB (opzionale, es: pg_dump ... )"
          value={form.databaseBackupCommand}
          onChange={(e) => setForm({ ...form, databaseBackupCommand: e.target.value })}
        />
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Accesso server (SSH/SFTP)</p>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Host" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} required />
          <Input placeholder="Porta" type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} required />
          <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <Select value={form.authType} onChange={(e) => setForm({ ...form, authType: e.target.value as SiteFormState["authType"] })}>
          <option value="password">Password</option>
          <option value="ssh_key">Chiave SSH</option>
        </Select>
        <Input
          placeholder={form.authType === "password" ? "Password account SSH" : "Private key SSH"}
          value={form.secret}
          onChange={(e) => setForm({ ...form, secret: e.target.value })}
          required
        />
        <Input placeholder="Passphrase chiave SSH (opzionale)" value={form.sshKey} onChange={(e) => setForm({ ...form, sshKey: e.target.value })} />
        <Input placeholder="Hint passphrase (opzionale)" value={form.passphraseHint} onChange={(e) => setForm({ ...form, passphraseHint: e.target.value })} />
      </section>

      {form.provider === "PLESK" ? (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Integrazione Plesk</p>
          <Input placeholder="URL Plesk (es. https://panel.example.com:8443)" value={form.pleskBaseUrl} onChange={(e) => setForm({ ...form, pleskBaseUrl: e.target.value })} required />
          <Input type="password" placeholder="API Token Plesk" value={form.pleskApiToken} onChange={(e) => setForm({ ...form, pleskApiToken: e.target.value })} required />
          <Input placeholder="Subscription ID (opzionale)" value={form.pleskSubscriptionId} onChange={(e) => setForm({ ...form, pleskSubscriptionId: e.target.value })} />
        </section>
      ) : null}

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Note</p>
        <Textarea placeholder="Note operative" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
      </section>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-300">{success}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvataggio..." : "Salva sito"}</Button>
    </form>
  );
}
