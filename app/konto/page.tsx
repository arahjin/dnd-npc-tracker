"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function KontoPage() {
  const router = useRouter();
  const t = useTranslations("konto");
  const { data: session, update } = useSession();

  // Name edit state
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError(t("nameRequired")); return; }
    setSavingName(true);
    setNameError(null);
    setNameSaved(false);
    const res = await fetch("/api/konto", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNameError(data.error ?? t("nameError"));
      setSavingName(false);
      return;
    }
    // Refresh JWT so header + dropdown reflect the new name
    await update({ name: data.name });
    router.refresh();
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  }

  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch("/api/konto", { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t("deleteError"));
      setDeleting(false);
      return;
    }
    // Sign out and redirect to landing page
    await signOut({ redirect: false });
    router.push("/");
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-2xl px-4 md:px-6" style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.back()} className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}>{t("back")}</button>
          <h1 className="font-cinzel text-lg font-bold tracking-widest" style={{ color: "var(--dnd-heading)" }}>
            {t("title")}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10 space-y-8">

        {/* Profile */}
        <section style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <div className="p-6">
            <h2 className="font-cinzel text-base font-semibold mb-4" style={{ color: "var(--dnd-heading)" }}>
              {t("profileTitle")}
            </h2>
            <form onSubmit={handleSaveName} className="space-y-3">
              <label className="font-cinzel text-xs tracking-[0.15em] uppercase block" style={{ color: "var(--dnd-label)" }}>
                {t("nameLabel")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameSaved(false); }}
                className="w-full px-4 py-2.5 text-base outline-none"
                style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif" }}
                maxLength={100}
              />

              {nameError && (
                <div className="font-cinzel text-xs px-4 py-2"
                  style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                  ✗ {nameError}
                </div>
              )}
              {nameSaved && (
                <div className="font-cinzel text-xs px-4 py-2"
                  style={{ background: "#0A1F0A", border: "1px solid #166534", color: "#4ADE80" }}>
                  ✓ {t("nameSaved")}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingName || !name.trim() || name.trim() === (session?.user?.name ?? "").trim()}
                  className="font-cinzel text-xs tracking-widest px-5 py-2.5 transition-all disabled:opacity-40"
                  style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}>
                  {savingName ? t("saving") : t("saveName")}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Danger zone */}
        <section style={{ background: "var(--dnd-bg-card)", border: "1px solid #991B1B" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red), var(--dnd-red-dark))" }} />
          <div className="p-6">
            <h2 className="font-cinzel text-base font-semibold mb-2" style={{ color: "#F87171" }}>
              {t("deleteTitle")}
            </h2>
            <p className="text-sm mb-1" style={{ color: "var(--dnd-text-muted)" }}>
              {t("deleteDesc")}
            </p>
            <ul className="text-sm mb-5 space-y-0.5 list-disc list-inside" style={{ color: "var(--dnd-text-muted)" }}>
              <li>{t("deleteItem1")}</li>
              <li>{t("deleteItem2")}</li>
              <li>{t("deleteItem3")}</li>
            </ul>
            <p className="font-cinzel text-xs mb-4" style={{ color: "#FCA5A5" }}>
              {t("deleteNote")}
            </p>

            {error && (
              <div className="font-cinzel text-xs px-4 py-3 mb-4"
                style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                ✗ {error}
              </div>
            )}

            {!confirm ? (
              <button
                onClick={() => setConfirm(true)}
                className="font-cinzel text-xs tracking-widest px-5 py-2.5 transition-all"
                style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                {t("deleteButton")}
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-cinzel text-xs" style={{ color: "#F87171" }}>
                  {t("deleteConfirmText")}
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="font-cinzel text-xs tracking-widest px-5 py-2.5 transition-all disabled:opacity-50"
                  style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                  {deleting ? t("deleting") : t("deleteConfirmButton")}
                </button>
                <button
                  onClick={() => { setConfirm(false); setError(null); }}
                  className="font-cinzel text-xs tracking-widest px-4 py-2.5 transition-all"
                  style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
                  {t("cancel")}
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
