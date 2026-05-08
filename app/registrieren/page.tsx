"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Suspense } from "react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`/api/invite/check?token=${token}`)
      .then((r) => r.json())
      .then((d) => setTokenValid(d.valid));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError("Passwörter stimmen nicht überein."); return; }
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen haben."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/registrieren", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Fehler bei der Registrierung."); setLoading(false); return; }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/");
    router.refresh();
  }

  const inputStyle = {
    background: "#0A0A0A", border: "1px solid #2A2A2A",
    color: "#D8D0C8", fontFamily: "'Roboto', sans-serif",
  };

  if (tokenValid === null) {
    return <p className="font-cinzel text-sm text-center" style={{ color: "var(--dnd-text-muted)" }}>Prüfe Einladungslink...</p>;
  }

  if (tokenValid === false) {
    return (
      <div className="text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="font-cinzel text-lg" style={{ color: "#F87171" }}>Ungültiger oder bereits verwendeter Einladungslink.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
      <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
      <div className="px-4 py-3" style={{ background: "#111", borderBottom: "1px solid var(--dnd-border)" }}>
        <h1 className="font-cinzel text-sm tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
          Konto erstellen
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="font-cinzel text-xs px-4 py-3" style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
            {error}
          </div>
        )}
        <div>
          <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="Dein Name" className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
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
        <div>
          <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Passwort wiederholen</label>
          <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required
            className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} className="ddb-cta w-full justify-center py-3">
          {loading ? "KONTO ERSTELLEN..." : "KONTO ERSTELLEN"}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <Image src="/wildgipfel_logo.png" alt="Wildgipfel" width={200} height={90} className="object-contain"
            style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9))" }} />
        </div>
        <Suspense fallback={<p className="font-cinzel text-sm text-center" style={{ color: "var(--dnd-text-muted)" }}>Laden...</p>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
