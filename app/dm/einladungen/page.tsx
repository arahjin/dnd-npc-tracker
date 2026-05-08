"use client";

import { useState, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";

type Invite = { id: string; token: string; usedById: string | null; createdAt: string };

export default function EinladungenPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { loadInvites(); }, []);

  async function loadInvites() {
    const res = await fetch("/api/invite");
    if (res.ok) setInvites(await res.json());
  }

  async function createInvite() {
    setLoading(true);
    const res = await fetch("/api/invite", { method: "POST" });
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

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-cinzel text-2xl font-bold" style={{ color: "var(--dnd-heading)" }}>Einladungslinks</h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-px w-40" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
              <span style={{ color: "var(--dnd-red)" }}>✦</span>
            </div>
          </div>
          <button onClick={createInvite} disabled={loading} className="ddb-cta">
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
                <code className="flex-1 text-xs truncate" style={{ color: inv.usedById ? "#4ADE80" : "var(--dnd-text-muted)", fontFamily: "monospace" }}>
                  {inv.usedById ? "✓ Verwendet" : inviteUrl(inv.token)}
                </code>
                {!inv.usedById && (
                  <button onClick={() => copyLink(inv.token)} className="ddb-cta" style={{ padding: "5px 12px", fontSize: "0.65rem" }}>
                    {copied === inv.token ? "✓ KOPIERT" : "KOPIEREN"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
