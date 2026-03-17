"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ProfileSettingsFormProps = {
  initial: {
    name: string;
    email: string;
    timezone: string;
    locale: string;
    theme: "dark" | "light";
    receiveEmails: boolean;
  };
};

export function ProfileSettingsForm({ initial }: ProfileSettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [locale, setLocale] = useState(initial.locale);
  const [theme, setTheme] = useState<"dark" | "light">(initial.theme);
  const [receiveEmails, setReceiveEmails] = useState(initial.receiveEmails);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          timezone,
          locale,
          theme,
          receiveEmails
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setProfileError(data?.message ?? "Errore aggiornamento profilo");
        return;
      }

      setProfileMessage("Profilo aggiornato correttamente");
      router.refresh();
    } catch {
      setProfileError("Errore di rete durante aggiornamento profilo");
    } finally {
      setProfileLoading(false);
    }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);
    setPasswordError(null);

    try {
      if (newPassword !== confirmPassword) {
        setPasswordError("Le due password nuove non coincidono");
        return;
      }

      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setPasswordError(data?.message ?? "Errore aggiornamento password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password aggiornata correttamente");
    } catch {
      setPasswordError("Errore di rete durante aggiornamento password");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <form onSubmit={submitProfile} className="space-y-3">
          <h2 className="text-sm font-semibold">Modifica dati profilo</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Timezone (es. Europe/Rome)" required />
            <Input value={locale} onChange={(e) => setLocale(e.target.value)} placeholder="Locale (es. it-IT)" required />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Select value={theme} onChange={(e) => setTheme(e.target.value as "dark" | "light")}>
              <option value="dark">Tema scuro</option>
              <option value="light">Tema chiaro</option>
            </Select>
            <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={receiveEmails}
                onChange={(e) => setReceiveEmails(e.target.checked)}
                className="h-4 w-4"
              />
              Ricevi notifiche email
            </label>
          </div>

          {profileError ? <p className="text-xs text-rose-300">{profileError}</p> : null}
          {profileMessage ? <p className="text-xs text-emerald-300">{profileMessage}</p> : null}

          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? "Salvataggio..." : "Salva profilo"}
          </Button>
        </form>
      </Card>

      <Card>
        <form onSubmit={submitPassword} className="space-y-3">
          <h2 className="text-sm font-semibold">Cambia password</h2>
          <Input
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Password attuale"
            type="password"
            required
          />
          <Input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nuova password"
            type="password"
            required
            minLength={10}
          />
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Conferma nuova password"
            type="password"
            required
            minLength={10}
          />

          {passwordError ? <p className="text-xs text-rose-300">{passwordError}</p> : null}
          {passwordMessage ? <p className="text-xs text-emerald-300">{passwordMessage}</p> : null}

          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "Aggiornamento..." : "Aggiorna password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
