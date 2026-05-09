"use client";

import { useState } from "react";
import Image from "next/image";

export default function EmailWartenPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setResending(true);
    setError(null);
    const res = await fetch("/api/auth/email-bestaetigen-erneut", { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setResent(true);
    setResending(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md px-4 text-center">
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
          <div className="p-8">
            <p className="text-4xl mb-4">✉️</p>
            <h1 className="font-cinzel text-xl font-bold mb-3" style={{ color: "var(--dnd-heading)" }}>
              E-Mail bestätigen
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--dnd-text-muted)" }}>
              Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte klicke auf den Link in der E-Mail, um deinen Account zu aktivieren.
            </p>

            {resent ? (
              <p className="font-cinzel text-sm" style={{ color: "#4ADE80" }}>✓ E-Mail erneut gesendet.</p>
            ) : (
              <button onClick={resend} disabled={resending}
                className="font-cinzel text-xs tracking-widest px-5 py-2.5 transition-colors"
                style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
                {resending ? "Sende..." : "E-Mail erneut senden"}
              </button>
            )}

            {error && <p className="mt-3 font-cinzel text-xs" style={{ color: "var(--dnd-red-light)" }}>✗ {error}</p>}
          </div>
        </div>

        <p className="mt-6 font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
          Falsches Konto?{" "}
          <a href="/login" style={{ color: "var(--dnd-red-light)" }}>Abmelden</a>
        </p>
      </div>
    </main>
  );
}
