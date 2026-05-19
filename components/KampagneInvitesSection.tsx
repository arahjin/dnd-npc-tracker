"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

type Invite = {
  id: string;
  token: string;
  role: string;
  isPermanent: boolean;
  active: boolean;
  usedById: string | null;
  createdAt: string;
  usedBy?: { id: string; name: string } | null;
};

type Props = { kampagneId: string; isAdmin: boolean };

export default function KampagneInvitesSection({ kampagneId, isAdmin }: Props) {
  const t = useTranslations("einladungen");
  const tk = useTranslations("kampagnenVerwalten");
  const tu = useTranslations("userMenu");
  const ROLE_LABEL: Record<string, string> = {
    SPIELER: tu("roles.SPIELER"),
    DUNGEON_MASTER: tu("roles.DUNGEON_MASTER"),
  };

  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState<"SPIELER" | "DUNGEON_MASTER">("SPIELER");
  const [copied, setCopied] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState("");
  const [kampagneName, setKampagneName] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`/api/kampagnen/${kampagneId}/invites`);
    if (res.ok) setInvites(await res.json());
    // Best-effort load campaign name for share text
    const kres = await fetch(`/api/kampagnen`);
    if (kres.ok) {
      const list = await kres.json();
      const k = list.find((x: { id: string; name: string }) => x.id === kampagneId);
      if (k) setKampagneName(k.name);
    }
  }, [kampagneId]);

  useEffect(() => { load(); }, [load]);

  const permanent = invites.find((i) => i.isPermanent && i.active) ?? null;
  const oneTimes = invites.filter((i) => !i.isPermanent && i.active);

  function permanentUrl(token: string) { return `${origin}/einladen/${token}`; }
  function registerUrl(token: string) { return `${origin}/registrieren?token=${token}`; }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {/* noop */}
  }

  async function share(url: string, key: string) {
    const text = tk("inviteShareText", { name: kampagneName || "Lorehub", url });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: kampagneName || "Lorehub", text, url });
        return;
      } catch {/* fall through to inline */}
    }
    setShareOpen(shareOpen === key ? null : key);
  }

  async function createOneTime() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/kampagnen/${kampagneId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole, isPermanent: false }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Fehler"); }
    else await load();
    setLoading(false);
  }

  async function generatePermanent() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/kampagnen/${kampagneId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "SPIELER", isPermanent: true }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Fehler"); }
    else await load();
    setLoading(false);
  }

  async function deactivate(inviteId: string) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/kampagnen/${kampagneId}/invites/${inviteId}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Fehler"); }
    else await load();
    setLoading(false);
  }

  function ShareInline({ url, k }: { url: string; k: string }) {
    if (shareOpen !== k) return null;
    const text = encodeURIComponent(tk("inviteShareText", { name: kampagneName || "Lorehub", url }));
    return (
      <div className="flex flex-wrap items-center gap-2 mt-2 px-2 py-1.5"
        style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
        <span className="font-cinzel text-xs" style={{ color: "var(--dnd-label)" }}>{tk("shareVia")}</span>
        <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noreferrer"
          className="font-cinzel text-xs px-2 py-1" style={{ border: "1px solid #2A2A2A", color: "#4ADE80" }}>
          {tk("shareWhatsapp")}
        </a>
        <a href={`sms:?&body=${text}`}
          className="font-cinzel text-xs px-2 py-1" style={{ border: "1px solid #2A2A2A", color: "#7DAEDB" }}>
          {tk("shareSms")}
        </a>
        <button onClick={() => copy(url, k + "-share")}
          className="font-cinzel text-xs px-2 py-1" style={{ border: "1px solid #2A2A2A", color: "var(--dnd-gold)" }}>
          {copied === k + "-share" ? t("copied") : tk("shareCopy")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="font-cinzel text-sm tracking-widest uppercase mb-3"
        style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)", paddingBottom: "6px" }}>
        {tk("invitesSectionTitle")}
      </h3>

      {error && <p className="mb-3 text-xs" style={{ color: "#F87171" }}>{error}</p>}

      {/* Permanent */}
      <div className="mb-6">
        <p className="font-cinzel text-xs mb-2" style={{ color: "var(--dnd-text-muted)" }}>{t("permanentTitle")}</p>
        <div style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }} className="px-3 py-3">
          {permanent ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 block text-xs px-2 py-1.5 truncate"
                  style={{ background: "#000", border: "1px solid #1A1A1A", color: "var(--dnd-gold)", fontFamily: "monospace" }}>
                  {permanentUrl(permanent.token)}
                </code>
                <button onClick={() => copy(permanentUrl(permanent.token), "perm-copy")}
                  className="ddb-cta shrink-0" style={{ padding: "5px 10px", fontSize: "0.6rem" }}>
                  {copied === "perm-copy" ? t("copied") : t("copy")}
                </button>
                <button onClick={() => share(permanentUrl(permanent.token), "perm")}
                  className="font-cinzel text-xs px-2 py-1.5 shrink-0"
                  style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
                  {tk("share")}
                </button>
              </div>
              <ShareInline url={permanentUrl(permanent.token)} k="perm" />
              <div className="flex gap-2">
                <button onClick={generatePermanent} disabled={loading}
                  className="font-cinzel text-xs px-3 py-1 disabled:opacity-40"
                  style={{ border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>
                  {t("regenerate")}
                </button>
                <button onClick={() => deactivate(permanent.id)} disabled={loading}
                  className="font-cinzel text-xs px-3 py-1 disabled:opacity-40"
                  style={{ border: "1px solid #7F1D1D", color: "#F87171" }}>
                  {t("deactivate")}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={generatePermanent} disabled={loading} className="ddb-cta disabled:opacity-50">
              {loading ? "…" : t("generate")}
            </button>
          )}
        </div>
      </div>

      {/* One-time */}
      <div>
        <p className="font-cinzel text-xs mb-2" style={{ color: "var(--dnd-text-muted)" }}>{t("oneTimeTitle")}</p>
        <div className="mb-3 flex items-center gap-2 p-2"
          style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
          <select value={newRole}
            onChange={(e) => setNewRole(e.target.value as "SPIELER" | "DUNGEON_MASTER")}
            className="font-cinzel text-xs px-2 py-1.5 flex-1 outline-none"
            style={{ background: "#000", border: "1px solid #1A1A1A", color: "var(--dnd-text)" }}>
            <option value="SPIELER">{tu("roles.SPIELER")}</option>
            {isAdmin && <option value="DUNGEON_MASTER">{tu("roles.DUNGEON_MASTER")}</option>}
          </select>
          <button onClick={createOneTime} disabled={loading} className="ddb-cta shrink-0"
            style={{ padding: "5px 12px", fontSize: "0.65rem" }}>
            {loading ? "…" : t("createButton")}
          </button>
        </div>

        {oneTimes.length === 0 ? (
          <p className="font-cinzel text-xs italic" style={{ color: "var(--dnd-text-muted)" }}>{t("empty")}</p>
        ) : (
          <div className="space-y-2">
            {oneTimes.map((inv) => {
              const url = registerUrl(inv.token);
              return (
                <div key={inv.id} style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }} className="px-3 py-2">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-cinzel text-xs px-2 py-0.5" style={{
                      background: inv.role === "DUNGEON_MASTER" ? "#2A1500" : "#0A0A1A",
                      color: inv.role === "DUNGEON_MASTER" ? "var(--dnd-gold)" : "#818CF8",
                      border: `1px solid ${inv.role === "DUNGEON_MASTER" ? "#78350F" : "#3730A3"}`,
                    }}>{ROLE_LABEL[inv.role] ?? inv.role}</span>
                    <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                      {new Date(inv.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 min-w-0 block text-xs px-2 py-1 truncate"
                      style={{ background: "#000", border: "1px solid #1A1A1A", color: "var(--dnd-text-muted)", fontFamily: "monospace" }}>
                      {url}
                    </code>
                    <button onClick={() => copy(url, `link-${inv.id}`)}
                      className="ddb-cta shrink-0" style={{ padding: "4px 8px", fontSize: "0.6rem" }}>
                      {copied === `link-${inv.id}` ? t("copied") : t("copy")}
                    </button>
                    <button onClick={() => share(url, `inv-${inv.id}`)}
                      className="font-cinzel text-xs px-2 py-1 shrink-0"
                      style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
                      {tk("share")}
                    </button>
                    <button onClick={() => deactivate(inv.id)} disabled={loading}
                      className="font-cinzel text-xs px-2 py-1 shrink-0 disabled:opacity-40"
                      style={{ border: "1px solid #7F1D1D", color: "#F87171" }}>
                      ✕
                    </button>
                  </div>
                  <ShareInline url={url} k={`inv-${inv.id}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
