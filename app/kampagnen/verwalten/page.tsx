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
  _count: { mitglieder: number };
};

type KampagneDetail = Kampagne & { mitglieder: Member[] };

export default function KampagnenVerwaltenPage() {
  const router = useRouter();
  const [kampagnen, setKampagnen] = useState<KampagneDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Per-campaign loading/confirm states
  const [removing, setRemoving] = useState<string | null>(null);       // memberId being removed
  const [deleting, setDeleting] = useState<string | null>(null);       // kampagneId being deleted
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // kampagneId awaiting confirm
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [kampRes, sessionRes] = await Promise.all([
      fetch("/api/kampagnen"),
      fetch("/api/auth/session"),
    ]);
    const kList: Kampagne[] = kampRes.ok ? await kampRes.json() : [];
    const session = sessionRes.ok ? await sessionRes.json() : null;
    setCurrentUserId(session?.user?.id ?? null);

    // Load members for each campaign
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

    // If leaving own campaign, clear cookie and go to /kampagnen
    if (userId === currentUserId) {
      await clearActiveIfNeeded(kampagneId);
      router.push("/kampagnen");
      router.refresh();
      return;
    }
    setRemoving(null);
    load();
  }

  async function deleteKampagne(kampagneId: string) {
    setDeleting(kampagneId);
    setError(null);
    const res = await fetch(`/api/kampagnen/${kampagneId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setDeleting(null); setConfirmDelete(null); return; }
    await clearActiveIfNeeded(kampagneId);
    router.push("/kampagnen");
    router.refresh();
  }

  async function clearActiveIfNeeded(kampagneId: string) {
    // Clear the aktiveKampagne cookie if it matches the deleted/left campaign
    const cookieRes = await fetch("/api/kampagnen/aktiv-loeschen", { method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kampagneId }),
    });
    return cookieRes;
  }

  const inputBase = "font-cinzel text-xs px-3 py-1.5 transition-colors";

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Lade...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-2xl px-6" style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.back()} className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}>← Zurück</button>
          <h1 className="font-cinzel text-lg font-bold tracking-widest" style={{ color: "var(--dnd-heading)" }}>
            Kampagnen verwalten
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10 space-y-8">
        {error && (
          <div className="font-cinzel text-xs px-4 py-3"
            style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
            ✗ {error}
          </div>
        )}

        {kampagnen.length === 0 && (
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
            Du bist in keiner Kampagne.
          </p>
        )}

        {kampagnen.map((k) => {
          const isDM = k.isDM;
          return (
            <section key={k.id} style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
              <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
              <div className="p-5">

                {/* Campaign header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-cinzel text-lg font-semibold" style={{ color: "var(--dnd-heading)" }}>{k.name}</h2>
                      {isDM && (
                        <span className="font-cinzel text-xs px-1.5 py-0.5"
                          style={{ background: "#1A0800", border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>DM</span>
                      )}
                    </div>
                    {k.beschreibung && (
                      <p className="text-sm mt-0.5" style={{ color: "var(--dnd-text-muted)" }}>{k.beschreibung}</p>
                    )}
                  </div>

                  {/* DM: delete | Player: leave */}
                  {isDM ? (
                    confirmDelete === k.id ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-cinzel text-xs" style={{ color: "#F87171" }}>Sicher?</span>
                        <button
                          onClick={() => deleteKampagne(k.id)}
                          disabled={deleting === k.id}
                          className={inputBase}
                          style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                          {deleting === k.id ? "..." : "Ja, löschen"}
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className={inputBase}
                          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setConfirmDelete(k.id); setError(null); }}
                        className={inputBase + " shrink-0"}
                        style={{ border: "1px solid #991B1B", color: "#F87171" }}>
                        Kampagne löschen
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => removeMember(k.id, currentUserId!)}
                      disabled={removing === `${k.id}-${currentUserId}`}
                      className={inputBase + " shrink-0"}
                      style={{ border: "1px solid #374151", color: "var(--dnd-text-muted)" }}>
                      {removing === `${k.id}-${currentUserId}` ? "..." : "Verlassen"}
                    </button>
                  )}
                </div>

                {/* Member list (DM only) */}
                {isDM && k.mitglieder.length > 0 && (
                  <div>
                    <p className="font-cinzel text-xs tracking-widest uppercase mb-2"
                      style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)", paddingBottom: "6px" }}>
                      Mitglieder · {k.mitglieder.length}
                    </p>
                    <div className="space-y-1.5">
                      {k.mitglieder.map((m) => {
                        const isSelf = m.userId === currentUserId;
                        const removeKey = `${k.id}-${m.userId}`;
                        return (
                          <div key={m.id} className="flex items-center gap-3 py-1.5 px-2"
                            style={{ borderBottom: "1px solid #1A1A1A" }}>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
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
                            {!isSelf && !m.isOwner && (
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
