"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("login");
  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const bereitsRegistriert = searchParams.get("bereitsRegistriert") === "1";
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
      setError(t("error"));
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  const inputStyle = {
    background: "#0A0A0A",
    border: "1px solid #2A2A2A",
    color: "#D8D0C8",
    fontFamily: "var(--font-roboto), sans-serif",
  };

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
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
              {t("submit")}
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {verified && (
              <div className="font-cinzel text-xs px-4 py-3"
                style={{ background: "#0A1A0A", border: "1px solid #1E3A1E", color: "#4ADE80" }}>
                {t("emailVerified")}
              </div>
            )}
            {reset && (
              <div className="font-cinzel text-xs px-4 py-3"
                style={{ background: "#0A1A0A", border: "1px solid #1E3A1E", color: "#4ADE80" }}>
                {t("passwordReset")}
              </div>
            )}
            {bereitsRegistriert && (
              <div className="font-cinzel text-xs px-4 py-3"
                style={{ background: "#1A1208", border: "1px solid #92400E", color: "#FCD34D" }}>
                {t("alreadyRegistered")}
              </div>
            )}
            {error && (
              <div className="font-cinzel text-xs px-4 py-3 tracking-wide"
                style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                {error}
              </div>
            )}
            <div>
              <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
                {t("email")}
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
                {t("password")}
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
            </div>
            <div className="flex items-center justify-between">
              <button type="submit" disabled={loading} className="ddb-cta py-3 px-8">
                {loading ? t("loading") : t("submit")}
              </button>
              <a href="/passwort-vergessen" className="font-cinzel text-xs"
                style={{ color: "var(--dnd-text-muted)" }}>
                {t("forgotPassword")}
              </a>
            </div>
          </form>
        </div>
        <p className="mt-4 text-center font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
          {t("noAccount")}{" "}
          <a href="/registrieren" style={{ color: "var(--dnd-red-light)" }}>{t("registerLink")}</a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
