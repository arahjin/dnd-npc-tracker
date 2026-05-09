"use client";

import { useState, useEffect } from "react";

type Invite = { id: string; token: string; usedById: string | null; role: string; createdAt: string };

const ROLE_LABEL: Record<string, string> = {
  SPIELER: "Spieler",
  DUNGEON_MASTER: "Dungeon Master",
  ADMIN: "Admin",
};

export default function EinladungenClient() {
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
        <h1 className="font-cinzel text-2xl font-bold" style={{ color: "var(--dnd-heading)" }}>Einladungen verwalten</h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-px w-40" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--dnd-text-muted)" }}>
          Generiere Einladungen für diese Kampagne. Jede Einladung kann einmal verwendet werden —
          entweder zur Neuregistrierung oder zum Beitreten für bestehende Nutzer.
        </p>
      </div>

      {/* Create new invite */}
      <div className="mb-8 flex items-center gap-3 p-4"
        style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
        <label className="font-cinzel text-xs tracking-widest uppercase shrink-0" style={{ color: "var(--dnd-label)" }}>
          Rolle
        </label>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as "SPIELER" | "DUNGEON_MASTER")}
          className="font-cinzel text-xs px-3 py-2 flex-1 outline-none"
          style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)" }}
        >
          <option value="SPIELER">Spieler</option>
          <option value="DUNGEON_MASTER">Dungeon Master</option>
        </select>
        <button onClick={createInvite} disabled={loading} className="ddb-cta shrink-0">
          {loading ? "..." : "+ Einladung erstellen"}
        </button>
      </div>

      {/* Invite list */}
      {invites.length === 0 ? (
        <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
          Noch keine Einladungen erstellt.
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
                      {ROLE_LABEL[inv.role]}
                    </span>
                    <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                      {new Date(inv.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    {used && (
                      <span className="font-cinzel text-xs ml-auto" style={{ color: "#4ADE80" }}>✓ Verwendet</span>
                    )}
                  </div>

                  {used ? null : (
                    <div className="space-y-2">
                      {/* Code for existing users */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs mb-1" style={{ color: "var(--dnd-label)" }}>
                            Code für bestehende Nutzer
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
                          {copied === `code-${inv.id}` ? "✓ KOPIERT" : "KOPIEREN"}
                        </button>
                      </div>

                      {/* Full link for new users */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs mb-1" style={{ color: "var(--dnd-label)" }}>
                            Registrierungslink für neue Nutzer
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
                          {copied === `link-${inv.id}` ? "✓ KOPIERT" : "KOPIEREN"}
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
