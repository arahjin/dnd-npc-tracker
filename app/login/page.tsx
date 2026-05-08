"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("E-Mail oder Passwort ungültig.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  const inputStyle = {
    background: "#0A0A0A",
    border: "1px solid #2A2A2A",
    color: "#D8D0C8",
    fontFamily: "'Roboto', sans-serif",
  };

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/wildgipfel_logo.png" alt="Wildgipfel" width={200} height={90} className="object-contain"
            style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9))" }} />
        </div>

        <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
          <div className="px-4 py-3" style={{ background: "#111", borderBottom: "1px solid var(--dnd-border)" }}>
            <h1 className="font-cinzel text-sm tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
              Anmelden
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="font-cinzel text-xs px-4 py-3 tracking-wide"
                style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                {error}
              </div>
            )}
            <div>
              <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
                E-Mail
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
                Passwort
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} className="ddb-cta w-full justify-center py-3">
              {loading ? "ANMELDEN..." : "ANMELDEN"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
          Noch kein Konto?{" "}
          <a href="/registrieren" style={{ color: "var(--dnd-red-light)" }}>Jetzt registrieren</a>
        </p>
      </div>
    </main>
  );
}
