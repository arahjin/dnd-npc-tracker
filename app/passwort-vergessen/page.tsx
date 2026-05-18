"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("passwordForgot");
  const tLogin = useTranslations("login");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/account/passwort-vergessen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t("generalError"));
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  const inputStyle = {
    background: "#0A0A0A", border: "1px solid #2A2A2A",
    color: "#D8D0C8", fontFamily: "var(--font-roboto), sans-serif",
  };

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
              {t("title")}
            </h1>
          </div>

          {sent ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-4">✉️</p>
              <p className="font-cinzel text-sm mb-2" style={{ color: "#4ADE80" }}>{t("emailSent")}</p>
              <p className="text-sm" style={{ color: "var(--dnd-text-muted)" }}>
                {t("checkSpam")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <p className="text-sm" style={{ color: "var(--dnd-text-muted)" }}>
                {t("instructions")}
              </p>
              {error && (
                <div className="font-cinzel text-xs px-4 py-3"
                  style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                  {error}
                </div>
              )}
              <div>
                <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
                  {tLogin("email")}
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                  className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="ddb-cta w-full justify-center py-3">
                {loading ? t("sending") : t("submit")}
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
          <a href="/login" style={{ color: "var(--dnd-red-light)" }}>{t("backToLogin")}</a>
        </p>
      </div>
    </main>
  );
}
