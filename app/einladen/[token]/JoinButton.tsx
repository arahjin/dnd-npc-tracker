"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function JoinButton({ token, isLoggedIn }: { token: string; isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("joinInvite");

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <a
          href={`/login?callbackUrl=/einladen/${token}`}
          className="ddb-cta block text-center w-full"
          style={{ padding: "12px 24px", fontSize: "0.8rem" }}>
          ANMELDEN UND BEITRETEN
        </a>
        <a
          href={`/registrieren?returnTo=/einladen/${token}`}
          className="font-cinzel text-xs tracking-widest block text-center w-full px-6 py-3 transition-all"
          style={{ border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>
          NEU REGISTRIEREN
        </a>
      </div>
    );
  }

  async function handleJoin() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/kampagnen/beitreten-permanent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok && res.status !== 400) {
      setError(data.error ?? t("joinError"));
      return;
    }
    // Already a member or just joined — either way, navigate to the campaign
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="ddb-cta w-full disabled:opacity-50"
        style={{ padding: "12px 24px", fontSize: "0.8rem" }}>
        {loading ? "…" : "KAMPAGNE BEITRETEN"}
      </button>
      {error && <p className="mt-3 text-sm text-center" style={{ color: "#F87171" }}>{error}</p>}
    </div>
  );
}
