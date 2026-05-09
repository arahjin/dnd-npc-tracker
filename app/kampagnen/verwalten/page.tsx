"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  isDM: boolean;
  isOwner: boolean;
  userId: string;
  user: { id: string; name: string; email: string };
};

type Kampagne = {
  id: string;
  name: string;
  beschreibung: string | null;
  isDM: boolean;
  isOwner: boolean;
  _count: { mitglieder: number };
};

type KampagneDetail = Kampagne & { mitglieder: Member[] };

export default function KampagnenVerwaltenPage() {
  const router = useRouter();
  const [kampagnen, setKampagnen] = useState<KampagneDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string>("SPIELER");

  const [removing, setRemoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [kampRes, sessionRes] = await Promise.all([
      fetch("/api/kampagnen"),
      fetch("/api/auth/session"),
    ]);
    const kList: Kampagne[] = kampRes.ok ? await kampRes.json() : [];
    const session = sessionRes.ok ? await sessionRes.json() : null;
    setCurrentUserId(session?.user?.id ?? null);
    setCurrentRole(session?.user?.role ?? "SPIELER");

    const details = await Promise.all(
      kList.map(async (k) => {
        const mRes = await fetch(`/api/kampagnen/${k.id}/mitglieder`);
        const mitglieder: Member[] = mRes.ok ? await mRes.json() : [];
        return { ...k, mitglieder };
      })
    );
    setKampagnen(details);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function removeMember(kampagneId: string, userId: string) {
    const key = `${kampagneId}-${userId}`;
    setRemoving(key);
    setError(null);
    const res = await fetch(`/api/kampagnen/${kampagneId}/mitglieder`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setRemoving(null); return; }

    if (userId === currentUserId) {
      // Left a campaign — clear cookie and reload page
      await clearCookieIfActive(kampagneId);
      setRemoving(null);
      load(); // reload management page (might now show fewer campaigns)
    } else {
      setRemoving(null);
      load();
    }
  }

  async function deleteKampagne(kampagneId: string) {
    setDeleting(kampagneId);
    setError(null);
    const res = await fetch(`/api/kampagnen/${kampagneId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setDeleting(null); setConfirmDelete(null); return; }
    await clearCookieIfActive(kampagneId);
    setDeleting(null);
    setConfirmDelete(null);
    load();
  }

  // Clear the aktiveKampagne cookie if it points to this campaign
  async function clearCookieIfActive(kampagneId: string) {
    await fetch("/api/kampagnen/aktiv-loeschen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kampagneId }),
    });
  }

  const isAdmin = currentRole === "ADMIN";

  // Can the current user remove a specific member from a campaign?
  function canRemove(k: KampagneDetail, m: Member): boolean {
    if (m.userId === currentUserId) return false; // can't remove yourself here (use "Verlassen")
    if (m.isOwner && !isAdmin) return false;       // owners are protected
    if (m.isDM && !k.isOwner && !isAdmin) return false; // only owner/admin can remove DMs
    if (isAdmin) return true;
    return k.isDM; // must be DM of the campaign to remove anyone
  }

  const btnBase = "font-cinzel text-xs px-3 py-1.5 transition-colors";

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
        <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 text-center">
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Lade...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#F8F5EF", borderBottom: "1px solid #D4D0C8" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-2xl px-4 md:px-6" style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.back()} className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}>← Zurück</button>
          <h1 className="font-cinzel text-lg font-bold" style={{ color: "var(--dnd-heading)" }}>
            Kampagnen verwalten
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10 space-y-8">
        {error && (
          <div className="font-cinzel text-xs px-4 py-3"
            style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
            ✗ {error}
          </div>
        )}

        {kampagnen.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-4 text-center">
            <p className="text-5xl">⚔</p>
            <p className="font-cinzel text-lg" style={{ color: "var(--dnd-heading)" }}>Keine Kampagnen</p>
            <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              Du bist in keiner Kampagne.
            </p>
            <a href="/kampagnen" className="ddb-cta mt-2">Kampagne beitreten oder erstellen</a>
          </div>
        )}

        {kampagnen.map((k) => {
          const isSelfDM = k.isDM;
          const isSelfOwner = k.isOwner;

          return (
            <section key={k.id} style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
              <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
              <div className="p-5">

                {/* Campaign header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-cinzel text-lg font-semibold" style={{ color: "var(--dnd-heading)" }}>{k.name}</h2>
                      {isSelfOwner && (
                        <span className="font-cinzel text-xs px-1.5 py-0.5"
                          style={{ background: "#1A0800", border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>Ersteller</span>
                      )}
                      {!isSelfOwner && isSelfDM && (
                        <span className="font-cinzel text-xs px-1.5 py-0.5"
                          style={{ background: "#1A0800", border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>DM</span>
                      )}
                    </div>
                    {k.beschreibung && (
                      <p className="text-sm mt-0.5" style={{ color: "var(--dnd-text-muted)" }}>{k.beschreibung}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Leave button (always available, not for owners unless they're the last DM) */}
                    {!isSelfOwner && (
                      <button
                        onClick={() => removeMember(k.id, currentUserId!)}
                        disabled={removing === `${k.id}-${currentUserId}`}
                        className={btnBase}
                        style={{ border: "1px solid #374151", color: "var(--dnd-text-muted)" }}>
                        {removing === `${k.id}-${currentUserId}` ? "..." : "Verlassen"}
                      </button>
                    )}

                    {/* Delete button (owner or admin only) */}
                    {(isSelfOwner || isAdmin) && (
                      confirmDelete === k.id ? (
                        <>
                          <span className="font-cinzel text-xs" style={{ color: "#F87171" }}>Sicher?</span>
                          <button onClick={() => deleteKampagne(k.id)} disabled={deleting === k.id}
                            className={btnBase}
                            style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                            {deleting === k.id ? "..." : "Ja, löschen"}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className={btnBase}
                            style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
                            Abbrechen
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setConfirmDelete(k.id); setError(null); }}
                          className={btnBase}
                          style={{ border: "1px solid #991B1B", color: "#F87171" }}>
                          Löschen
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Member list — shown to DMs and admins */}
                {(isSelfDM || isAdmin) && k.mitglieder.length > 0 && (
                  <div>
                    <p className="font-cinzel text-xs tracking-widest uppercase mb-2"
                      style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)", paddingBottom: "6px" }}>
                      Mitglieder · {k.mitglieder.length}
                    </p>
                    <div className="space-y-1">
                      {k.mitglieder.map((m) => {
                        const isSelf = m.userId === currentUserId;
                        const removeKey = `${k.id}-${m.userId}`;
                        const showRemove = canRemove(k, m);

                        return (
                          <div key={m.id} className="flex items-center gap-3 py-1.5 px-2"
                            style={{ borderBottom: "1px solid #FFFFFF" }}>
                            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                              <span className="font-cinzel text-sm" style={{ color: "var(--dnd-text)" }}>
                                {m.user.name}
                                {isSelf && <span className="ml-1" style={{ color: "var(--dnd-text-muted)", fontSize: "0.7rem" }}>(du)</span>}
                              </span>
                              {m.isOwner && (
                                <span className="font-cinzel text-xs px-1.5 py-0.5"
                                  style={{ background: "#1A0800", border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
                                  Ersteller
                                </span>
                              )}
                              {!m.isOwner && m.isDM && (
                                <span className="font-cinzel text-xs" style={{ color: "var(--dnd-gold)" }}>DM</span>
                              )}
                              {!m.isDM && (
                                <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>Spieler</span>
                              )}
                            </div>
                            {showRemove && (
                              <button
                                onClick={() => removeMember(k.id, m.userId)}
                                disabled={removing === removeKey}
                                className="font-cinzel text-xs px-2 py-1 transition-colors"
                                style={{ border: "1px solid #374151", color: "var(--dnd-text-muted)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#F87171"; e.currentTarget.style.borderColor = "#991B1B"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dnd-text-muted)"; e.currentTarget.style.borderColor = "#374151"; }}>
                                {removing === removeKey ? "..." : "Entfernen"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
