"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      let data: { message?: string } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message ?? "Login fallito");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Errore di rete o server non raggiungibile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Email</label>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Password</label>
        <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Accesso in corso..." : "Accedi"}
      </Button>
    </form>
  );
}
