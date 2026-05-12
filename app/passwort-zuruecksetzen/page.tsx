"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PASSWORD_HINT } from "@/lib/password";
import Image from "next/image";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError("Passwörter stimmen nicht überein."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/account/passwort-zuruecksetzen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Fehler."); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/login?reset=1"), 2000);
  }

  const inputStyle = {
    background: "#0A0A0A", border: "1px solid #2A2A2A",
    color: "#D8D0C8", fontFamily: "var(--font-roboto), sans-serif",
  };

  if (!token) {
    return (
      <div className="p-6 text-center">
        <p className="font-cinzel text-sm" style={{ color: "#F87171" }}>⚠ Ungültiger Link.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-8 text-center">
        <p className="text-3xl mb-4">✓</p>
        <p className="font-cinzel text-sm" style={{ color: "#4ADE80" }}>Passwort geändert! Weiterleitung...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <p className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>{PASSWORD_HINT}</p>
      {error && (
        <div className="font-cinzel text-xs px-4 py-3"
          style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
          {error}
        </div>
      )}
      <div>
        <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
          Neues Passwort
        </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus
          className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
      </div>
      <div>
        <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
          Passwort wiederholen
        </label>
        <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required
          className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
      </div>
      <button type="submit" disabled={loading} className="ddb-cta w-full justify-center py-3">
        {loading ? "SPEICHERN..." : "PASSWORT SETZEN"}
      </button>
    </form>
  );
}

export default function PasswortZuruecksetzenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <Image
            src="/lorehub_logo.png"
            alt="Lorehub"
            width={280} height={80}
            className="object-contain"
            style={{ height: "60px", width: "auto" }}
          />
        </div>
        <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
          <div className="px-4 py-3" style={{ background: "#111", borderBottom: "1px solid var(--dnd-border)" }}>
            <h1 className="font-cinzel text-sm tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
              Neues Passwort setzen
            </h1>
          </div>
          <Suspense fallback={<div className="p-6"><p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Laden...</p></div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
