"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SiteEditActionsProps = {
  siteId: string;
  initial: {
    name: string;
    domain: string;
    provider: "GENERIC" | "PLESK";
    environment: "PROD" | "STAGING" | "DEV";
    rootPath: string;
    notes: string | null;
    databaseBackupCommand: string | null;
    connection: {
      host: string;
      port: number;
      username: string;
      connectionProtocol: "SFTP" | "FTP" | "FTPS";
      authType: "password" | "ssh_key";
      pleskBaseUrl: string | null;
      pleskSubscriptionId: string | null;
    } | null;
  };
};

export function SiteEditActions({ siteId, initial }: SiteEditActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateConnection, setUpdateConnection] = useState(false);

  const [name, setName] = useState(initial.name);
  const [domain, setDomain] = useState(initial.domain);
  const [provider, setProvider] = useState<"GENERIC" | "PLESK">(initial.provider);
  const [environment, setEnvironment] = useState<"PROD" | "STAGING" | "DEV">(initial.environment);
  const [rootPath, setRootPath] = useState(initial.rootPath);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [databaseBackupCommand, setDatabaseBackupCommand] = useState(initial.databaseBackupCommand ?? "");

  const [host, setHost] = useState(initial.connection?.host ?? "");
  const [port, setPort] = useState(initial.connection?.port ?? 22);
  const [username, setUsername] = useState(initial.connection?.username ?? "");
  const [connectionProtocol, setConnectionProtocol] = useState<"SFTP" | "FTP" | "FTPS">(initial.connection?.connectionProtocol ?? "SFTP");
  const [authType, setAuthType] = useState<"password" | "ssh_key">(initial.connection?.authType ?? "password");
  const [secret, setSecret] = useState("");
  const [sshKey, setSshKey] = useState("");
  const [passphraseHint, setPassphraseHint] = useState("");
  const [pleskBaseUrl, setPleskBaseUrl] = useState(initial.connection?.pleskBaseUrl ?? "");
  const [pleskSubscriptionId, setPleskSubscriptionId] = useState(initial.connection?.pleskSubscriptionId ?? "");
  const [pleskApiToken, setPleskApiToken] = useState("");

  const ftpMode = connectionProtocol === "FTP" || connectionProtocol === "FTPS";

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {
        name,
        domain,
        provider,
        environment,
        rootPath,
        notes: notes || null,
        databaseBackupCommand: databaseBackupCommand || null
      };

      if (updateConnection) {
        payload.host = host;
        payload.port = port;
        payload.username = username;
        payload.connectionProtocol = connectionProtocol;
        payload.authType = ftpMode ? "password" : authType;
        payload.secret = secret;
        payload.sshKey = sshKey || null;
        payload.passphraseHint = passphraseHint || null;
        payload.pleskBaseUrl = pleskBaseUrl || null;
        payload.pleskSubscriptionId = pleskSubscriptionId || null;
        payload.pleskApiToken = pleskApiToken || null;
      }

      const response = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Errore aggiornamento sito");
        return;
      }

      setMessage("Sito aggiornato correttamente");
      setSecret("");
      setSshKey("");
      setPassphraseHint("");
      setPleskApiToken("");
      setUpdateConnection(false);
      router.refresh();
    } catch {
      setError("Errore di rete durante aggiornamento sito");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Confermi eliminazione sito? L'operazione archivia il sito e lo rimuove dalla lista attiva.");
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "Errore eliminazione sito");
        return;
      }

      router.push("/sites");
      router.refresh();
    } catch {
      setError("Errore di rete durante eliminazione sito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-3">
      <h2 className="text-sm font-semibold">Modifica sito</h2>

      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
      <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Dominio" required />

      <div className="grid gap-2 sm:grid-cols-2">
        <Select value={environment} onChange={(e) => setEnvironment(e.target.value as "PROD" | "STAGING" | "DEV")}>
          <option value="PROD">Produzione (PROD)</option>
          <option value="STAGING">Staging (STAGING)</option>
          <option value="DEV">Sviluppo (DEV)</option>
        </Select>
        <Select value={provider} onChange={(e) => setProvider(e.target.value as "GENERIC" | "PLESK")}>
          <option value="GENERIC">Server generico</option>
          <option value="PLESK">Plesk</option>
        </Select>
      </div>

      <Input value={rootPath} onChange={(e) => setRootPath(e.target.value)} placeholder="Root path" required />

      <Input
        value={databaseBackupCommand}
        onChange={(e) => setDatabaseBackupCommand(e.target.value)}
        placeholder="Comando backup DB (opzionale)"
      />
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note" rows={3} />

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={updateConnection}
          onChange={(e) => setUpdateConnection(e.target.checked)}
          className="h-4 w-4"
        />
        Aggiorna credenziali connessione
      </label>

      {updateConnection ? (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="Host" required={updateConnection} />
            <Input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} placeholder="Porta" required={updateConnection} />
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required={updateConnection} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Select value={connectionProtocol} onChange={(e) => { const p = e.target.value as "SFTP" | "FTP" | "FTPS"; setConnectionProtocol(p); if (p !== "SFTP") setAuthType("password"); }}>
              <option value="SFTP">SFTP (SSH)</option>
              <option value="FTP">FTP</option>
              <option value="FTPS">FTPS</option>
            </Select>

            <Select value={authType} onChange={(e) => setAuthType(e.target.value as "password" | "ssh_key")} disabled={ftpMode}>
              <option value="password">Password</option>
              <option value="ssh_key">SSH Key</option>
            </Select>
          </div>

          <Input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={authType === "password" ? "Nuova password" : "Nuova private key"}
            required={updateConnection}
          />

          {!ftpMode ? (
            <>
              <Input value={sshKey} onChange={(e) => setSshKey(e.target.value)} placeholder="Passphrase (opzionale)" />
              <Input value={passphraseHint} onChange={(e) => setPassphraseHint(e.target.value)} placeholder="Passphrase hint (opzionale)" />
            </>
          ) : null}

          {provider === "PLESK" ? (
            <>
              <Input value={pleskBaseUrl} onChange={(e) => setPleskBaseUrl(e.target.value)} placeholder="URL panel Plesk" />
              <Input value={pleskSubscriptionId} onChange={(e) => setPleskSubscriptionId(e.target.value)} placeholder="Subscription ID (opzionale)" />
              <Input type="password" value={pleskApiToken} onChange={(e) => setPleskApiToken(e.target.value)} placeholder="Nuovo API token Plesk (opzionale)" />
            </>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-300">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Salvataggio..." : "Salva modifiche"}</Button>
        <Button type="button" variant="danger" disabled={loading} onClick={handleDelete}>Elimina sito</Button>
      </div>
    </form>
  );
}
