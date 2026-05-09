"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LogoFull } from "@/components/Icons";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      let data: { error?: string; ok?: boolean } = {};
      try { data = await res.json(); } catch { /* ignore parse errors */ }
      if (!res.ok) {
        setError(data.error ?? `Fehler (HTTP ${res.status})`);
        setLoading(false);
        return;
      }
      setDone(true);
      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
    } catch (err) {
      setError(`Netzwerkfehler: ${String(err)}`);
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "#0A0A0A", border: "1px solid #2A2A2A",
    color: "#D8D0C8", fontFamily: "'Roboto', sans-serif",
  };

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <LogoFull
            color="var(--dnd-gold)"
            style={{ height: "60px", width: "auto" }}
          />
        </div>

        <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
          <div className="px-4 py-3" style={{ background: "#111", borderBottom: "1px solid var(--dnd-border)" }}>
            <h1 className="font-cinzel text-sm tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
              Ersteinrichtung · Dungeon Master
            </h1>
          </div>

          {done ? (
            <div className="p-6 text-center">
              <p className="font-cinzel text-sm" style={{ color: "#4ADE80" }}>✓ DM-Konto erstellt. Weiterleitung...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <p className="font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-text-muted)" }}>
                Diese Seite ist nur verfügbar, solange noch kein Benutzer existiert.
              </p>
              {error && (
                <div className="font-cinzel text-xs px-4 py-3" style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                  {error}
                </div>
              )}
              <div>
                <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>E-Mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Passwort</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Mindestens 8 Zeichen" className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="ddb-cta w-full justify-center py-3">
                {loading ? "ERSTELLEN..." : "DM-KONTO ERSTELLEN"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
