"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { PASSWORD_HINT } from "@/lib/password";
import Image from "next/image";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("register");
  const token = searchParams.get("token") ?? "";
  const returnTo = searchParams.get("returnTo") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{ valid: boolean; checked: boolean }>({ valid: false, checked: false });

  useEffect(() => {
    if (!token) { setInviteInfo({ valid: false, checked: true }); return; }
    fetch(`/api/invite/check?token=${token}`)
      .then((r) => r.json())
      .then((d) => setInviteInfo({ valid: d.valid, checked: true }));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError(t("errorMismatch")); return; }
    if (password.length < 8) { setError(t("errorLength")); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/registrieren", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token || undefined, name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? t("errorGeneral")); setLoading(false); return; }

    const signInRes = await signIn("credentials", { email, password, redirect: false });

    if (signInRes && (signInRes as { error?: string }).error) {
      router.push("/login?bereitsRegistriert=1");
      return;
    }

    if (data.kampagneId) {
      await fetch(`/api/kampagnen/${data.kampagneId}/aktiv`, { method: "POST" });
    }

    router.push(returnTo || "/dashboard");
    router.refresh();
  }

  const inputStyle = {
    background: "#0A0A0A", border: "1px solid #2A2A2A",
    color: "#D8D0C8", fontFamily: "var(--font-roboto), sans-serif",
  };

  const tokenInvalid = token && inviteInfo.checked && !inviteInfo.valid;

  return (
    <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
      <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
      <div className="px-4 py-3" style={{ background: "#111", borderBottom: "1px solid var(--dnd-border)" }}>
        <h1 className="font-cinzel text-sm tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
          {t("title")}
        </h1>
      </div>

      {token && inviteInfo.checked && inviteInfo.valid && (
        <div className="px-6 pt-5 pb-0">
          <div className="font-cinzel text-xs px-4 py-3 tracking-wide"
            style={{ background: "#0A1A0A", border: "1px solid #1E3A1E", color: "#4ADE80" }}>
            {t("inviteValid")}
          </div>
        </div>
      )}

      {tokenInvalid && (
        <div className="px-6 pt-5 pb-0">
          <div className="font-cinzel text-xs px-4 py-3 tracking-wide"
            style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
            {t("inviteInvalid")}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="font-cinzel text-xs px-4 py-3"
            style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
            {error}
          </div>
        )}
        <div>
          <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>{t("name")}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder={t("namePlaceholder")} autoFocus className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>{t("email")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>{t("password")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
          <p className="mt-1 text-xs" style={{ color: "var(--dnd-text-muted)" }}>{PASSWORD_HINT}</p>
        </div>
        <div>
          <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>{t("passwordConfirm")}</label>
          <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required
            className="w-full px-4 py-2.5 text-base outline-none" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} className="ddb-cta w-full justify-center py-3">
          {loading ? t("loading") : t("submit")}
        </button>
        <p className="text-center font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
          {t("alreadyHaveAccount")}{" "}
          <a href="/login" style={{ color: "var(--dnd-red-light)" }}>{t("signInLink")}</a>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
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
        <Suspense fallback={<p className="font-cinzel text-sm text-center" style={{ color: "var(--dnd-text-muted)" }}>…</p>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
