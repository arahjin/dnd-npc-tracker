"use client";

import { useState, useEffect } from "react";

type Invite = { id: string; token: string; usedById: string | null; role: string; createdAt: string };

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

  function inviteUrl(token: string) {
    return `${window.location.origin}/registrieren?token=${token}`;
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(inviteUrl(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  const ROLE_LABEL: Record<string, string> = {
    SPIELER: "Spieler",
    DUNGEON_MASTER: "Dungeon Master",
    ADMIN: "Admin",
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-cinzel text-2xl font-bold" style={{ color: "var(--dnd-heading)" }}>Einladungslinks</h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-px w-40" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>
      </div>

      {/* Create new invite */}
      <div className="mb-8 flex items-center gap-3 p-4" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
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
          {loading ? "..." : "+ Neuen Link erstellen"}
        </button>
      </div>

      {invites.length === 0 ? (
        <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Noch keine Einladungslinks erstellt.</p>
      ) : (
        <div className="space-y-2">
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 px-4 py-3"
              style={{ background: "var(--dnd-bg-card)", border: `1px solid ${inv.usedById ? "#1E3A1E" : "var(--dnd-border)"}` }}>
              <span className="font-cinzel text-xs shrink-0 px-2 py-0.5"
                style={{ background: inv.role === "DUNGEON_MASTER" ? "#2A1500" : "#0A0A1A", color: inv.role === "DUNGEON_MASTER" ? "var(--dnd-gold)" : "#818CF8", border: `1px solid ${inv.role === "DUNGEON_MASTER" ? "#78350F" : "#3730A3"}` }}>
                {ROLE_LABEL[inv.role]}
              </span>
              <code className="flex-1 text-xs truncate" style={{ color: inv.usedById ? "#4ADE80" : "var(--dnd-text-muted)", fontFamily: "monospace" }}>
                {inv.usedById ? "✓ Verwendet" : inviteUrl(inv.token)}
              </code>
              {!inv.usedById && (
                <button onClick={() => copyLink(inv.token)} className="ddb-cta shrink-0" style={{ padding: "5px 12px", fontSize: "0.65rem" }}>
                  {copied === inv.token ? "✓ KOPIERT" : "KOPIEREN"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
