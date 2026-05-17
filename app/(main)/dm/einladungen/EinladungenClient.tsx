"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

type Invite = { id: string; token: string; usedById: string | null; role: string; createdAt: string };
type PermanentInvite = { token: string; createdAt: string } | null;

// ── Permanent link panel ──────────────────────────────────────────────────────

function PermanentInvitePanel() {
  const t = useTranslations("einladungen");
  const [invite, setInvite] = useState<PermanentInvite>(undefined as unknown as PermanentInvite);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/invite/permanent");
    if (!res.ok) { setError(t("errorLoad")); return; }
    setInvite(await res.json());
  }, [t]);

  useEffect(() => { load(); }, [load]);

  function inviteUrl(token: string) {
    return `${window.location.origin}/einladen/${token}`;
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function generate() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/invite/permanent", { method: "POST" });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? t("errorGenerate")); setLoading(false); return; }
    await load();
    setLoading(false);
  }

  async function deactivate() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/invite/permanent", { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? t("errorDeactivate")); setLoading(false); return; }
    await load();
    setLoading(false);
  }

  // Still loading initial state
  if (invite === undefined) return null;

  return (
    <div className="mb-10">
      <h2 className="font-cinzel text-lg font-semibold mb-1" style={{ color: "var(--dnd-heading)" }}>
        {t("permanentTitle")}
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--dnd-text-muted)" }}>
        {t("permanentDesc")}
      </p>

      <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
        <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
        <div className="px-4 py-4">
          {error && <p className="mb-3 text-xs" style={{ color: "#F87171" }}>{error}</p>}
          {invite ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 min-w-0 block text-sm px-3 py-2 truncate"
                  style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-gold)", fontFamily: "monospace" }}>
                  {inviteUrl(invite.token)}
                </code>
                <button
                  onClick={() => copy(inviteUrl(invite.token))}
                  className="ddb-cta shrink-0"
                  style={{ padding: "6px 14px", fontSize: "0.65rem" }}>
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="font-cinzel text-xs tracking-widest px-3 py-1.5 transition-all disabled:opacity-40"
                  style={{ border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>
                  {t("regenerate")}
                </button>
                <button
                  onClick={deactivate}
                  disabled={loading}
                  className="font-cinzel text-xs tracking-widest px-3 py-1.5 transition-all disabled:opacity-40"
                  style={{ border: "1px solid #7F1D1D", color: "#F87171" }}>
                  {t("deactivate")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={generate}
              disabled={loading}
              className="ddb-cta disabled:opacity-50">
              {loading ? "…" : t("generate")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── One-time invite panel ─────────────────────────────────────────────────────

export default function EinladungenClient() {
  const t = useTranslations("einladungen");
  const tu = useTranslations("userMenu");
  const ROLE_LABEL: Record<string, string> = {
    SPIELER: tu("roles.SPIELER"),
    DUNGEON_MASTER: tu("roles.DUNGEON_MASTER"),
    ADMIN: tu("roles.ADMIN"),
  };
  const [invites, setInvites] = useState<Invite[]>([]);
  const [newRole, setNewRole] = useState<"SPIELER" | "DUNGEON_MASTER">("SPIELER");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { loadInvites(); }, []);

  async function loadInvites() {
    const res = await fetch("/api/invite");
    if (res.ok) setInvites(await res.json());
  }

  async function createInvite() {
    setLoading(true);
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) await loadInvites();
    setLoading(false);
  }

  function registrierUrl(token: string) {
    return `${window.location.origin}/registrieren?token=${token}`;
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-cinzel text-2xl font-bold" style={{ color: "var(--dnd-heading)" }}>{t("title")}</h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-px w-40" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>
      </div>

      <PermanentInvitePanel />

      <div className="mb-6">
        <h2 className="font-cinzel text-lg font-semibold mb-1" style={{ color: "var(--dnd-heading)" }}>
          {t("oneTimeTitle")}
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--dnd-text-muted)" }}>
          {t("oneTimeDesc")}
        </p>
      </div>

      {/* Create new invite */}
      <div className="mb-8 flex items-center gap-3 p-4"
        style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
        <label className="font-cinzel text-xs tracking-widest uppercase shrink-0" style={{ color: "var(--dnd-label)" }}>
          {t("role")}
        </label>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as "SPIELER" | "DUNGEON_MASTER")}
          className="font-cinzel text-xs px-3 py-2 flex-1 outline-none"
          style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)" }}
        >
          <option value="SPIELER">{tu("roles.SPIELER")}</option>
          <option value="DUNGEON_MASTER">{tu("roles.DUNGEON_MASTER")}</option>
        </select>
        <button onClick={createInvite} disabled={loading} className="ddb-cta shrink-0">
          {loading ? "..." : t("createButton")}
        </button>
      </div>

      {/* Invite list */}
      {invites.length === 0 ? (
        <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
          {t("empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {invites.map((inv) => {
            const used = !!inv.usedById;
            return (
              <div key={inv.id} style={{
                background: "var(--dnd-bg-card)",
                border: `1px solid ${used ? "#1E3A1E" : "var(--dnd-border)"}`,
              }}>
                <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                <div className="px-4 py-3">

                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-cinzel text-xs px-2 py-0.5 shrink-0" style={{
                      background: inv.role === "DUNGEON_MASTER" ? "#2A1500" : "#0A0A1A",
                      color: inv.role === "DUNGEON_MASTER" ? "var(--dnd-gold)" : "#818CF8",
                      border: `1px solid ${inv.role === "DUNGEON_MASTER" ? "#78350F" : "#3730A3"}`,
                    }}>
                      {ROLE_LABEL[inv.role] ?? inv.role}
                    </span>
                    <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                      {new Date(inv.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    {used && (
                      <span className="font-cinzel text-xs ml-auto" style={{ color: "#4ADE80" }}>{t("used")}</span>
                    )}
                  </div>

                  {used ? null : (
                    <div className="space-y-2">
                      {/* Code for existing users */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs mb-1" style={{ color: "var(--dnd-label)" }}>
                            {t("codeLabel")}
                          </p>
                          <code className="block text-sm px-3 py-1.5 truncate"
                            style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-gold)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                            {inv.token}
                          </code>
                        </div>
                        <button
                          onClick={() => copy(inv.token, `code-${inv.id}`)}
                          className="ddb-cta shrink-0 self-end"
                          style={{ padding: "6px 14px", fontSize: "0.65rem" }}>
                          {copied === `code-${inv.id}` ? t("copied") : t("copy")}
                        </button>
                      </div>

                      {/* Full link for new users */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs mb-1" style={{ color: "var(--dnd-label)" }}>
                            {t("linkLabel")}
                          </p>
                          <code className="block text-xs px-3 py-1.5 truncate"
                            style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)", fontFamily: "monospace" }}>
                            {registrierUrl(inv.token)}
                          </code>
                        </div>
                        <button
                          onClick={() => copy(registrierUrl(inv.token), `link-${inv.id}`)}
                          className="ddb-cta shrink-0 self-end"
                          style={{ padding: "6px 14px", fontSize: "0.65rem" }}>
                          {copied === `link-${inv.id}` ? t("copied") : t("copy")}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
