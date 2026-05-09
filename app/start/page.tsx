import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lorehub – Dein digitales Kampagnen-Archiv für Pen & Paper",
  description:
    "Lorehub hilft Dungeon Masters und Spielern, ihre Pen-&-Paper-Kampagnen zu verwalten: NPCs, Organisationen, Locations, Charaktere, Tagebuch und mehr – alles an einem Ort.",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FeatureCard({
  icon, title, description,
}: { icon: string; title: string; description: string }) {
  return (
    <div style={{
      background: "var(--dnd-bg-card)",
      border: "1px solid var(--dnd-border)",
      padding: "28px 24px",
      position: "relative",
      flex: "1 1 220px",
    }}>
      {/* Gold corner accents */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid var(--dnd-gold)", borderLeft: "2px solid var(--dnd-gold)" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, borderTop: "2px solid var(--dnd-gold)", borderRight: "2px solid var(--dnd-gold)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, borderBottom: "2px solid var(--dnd-gold)", borderLeft: "2px solid var(--dnd-gold)" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid var(--dnd-gold)", borderRight: "2px solid var(--dnd-gold)" }} />

      <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{icon}</div>
      <h3 className="font-cinzel font-bold mb-3" style={{ color: "var(--dnd-heading)", fontSize: "1.05rem", letterSpacing: "0.04em" }}>
        {title}
      </h3>
      <p style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", fontSize: "0.9rem", lineHeight: 1.65 }}>
        {description}
      </p>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="font-cinzel font-bold" style={{
      width: 40, height: 40, borderRadius: "50%",
      background: "var(--dnd-red-dark)", border: "2px solid var(--dnd-red)",
      color: "#FCA5A5", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.9rem", flexShrink: 0,
    }}>{n}</div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "0 auto", maxWidth: 480, width: "100%" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--dnd-border))" }} />
      <span style={{ color: "var(--dnd-gold)", opacity: 0.6 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--dnd-border), transparent)" }} />
    </div>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="font-cinzel font-bold" style={{ color: "var(--dnd-heading)", fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "0.03em" }}>
        {children}
      </h2>
      {sub && <p className="mt-3 text-sm" style={{ color: "var(--dnd-text-muted)", fontFamily: "'Roboto', sans-serif", maxWidth: 560, margin: "12px auto 0" }}>{sub}</p>}
      <div style={{ width: 48, height: 2, background: "var(--dnd-red)", margin: "16px auto 0" }} />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function StartPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  let settings = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch { /* fallback */ }

  const subtitle = settings?.landingSubtitle || "Dein digitales Kampagnen-Archiv für Pen & Paper";
  const bodyText = settings?.landingBody || "";
  const paragraphs = bodyText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div style={{ background: "var(--dnd-bg)" }}>

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <header style={{ background: "rgba(10,10,10,0.95)", borderBottom: "1px solid #2A2A2A", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6" style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/start">
            <Image src="/lorehub_logo.png" alt="Lorehub" width={120} height={54} className="object-contain"
              style={{ width: "clamp(80px, 12vw, 110px)", height: "auto", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isLoggedIn ? (
              <Link href="/" className="ddb-cta" style={{ padding: "8px 20px", fontSize: "0.75rem" }}>Zur App →</Link>
            ) : (
              <>
                <Link href="/login" className="font-cinzel text-xs tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.6)", padding: "8px 16px", textDecoration: "none" }}>
                  Anmelden
                </Link>
                <Link href="/registrieren" className="ddb-cta" style={{ padding: "8px 20px", fontSize: "0.75rem" }}>
                  Kostenlos starten
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Background image */}
        <Image
          src="/lorehub_header.png"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: "center top", opacity: 0.35 }}
          priority
        />
        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(14,14,14,0.3) 0%, rgba(14,14,14,0.5) 60%, rgba(14,14,14,1) 100%)" }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px 24px 80px" }}>
          <Image
            src="/lorehub_logo.png"
            alt="Lorehub"
            width={380} height={171}
            className="object-contain"
            style={{ width: "clamp(180px, 35vw, 340px)", height: "auto", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.8))", marginBottom: "24px" }}
            priority
          />

          {subtitle && (
            <p className="font-cinzel" style={{
              color: "var(--dnd-gold)", fontSize: "clamp(0.95rem, 2.2vw, 1.3rem)",
              letterSpacing: "0.1em", maxWidth: 640, marginBottom: paragraphs.length ? "20px" : "36px",
            }}>
              {subtitle}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div style={{ maxWidth: 640, marginBottom: "36px" }}>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", fontSize: "1rem", lineHeight: 1.7, marginBottom: "12px" }}>
                  {p}
                </p>
              ))}
            </div>
          )}

          {isLoggedIn ? (
            <Link href="/" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "14px 40px" }}>
              Zur App →
            </Link>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/registrieren" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "14px 40px" }}>
                Kostenlos starten
              </Link>
              <Link href="/login"
                className="font-cinzel text-sm tracking-widest uppercase"
                style={{ padding: "14px 28px", border: "1px solid var(--dnd-border)", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                Anmelden
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="mx-auto max-w-6xl">
          <SectionTitle sub="Alles, was ihr für eine unvergessliche Kampagne braucht – an einem Ort.">
            Was Lorehub bietet
          </SectionTitle>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
            <FeatureCard
              icon="📜"
              title="Objekte & Weltelemente"
              description="Verwalte NPCs, Organisationen, Spielercharaktere und Locations mit detaillierten Profilen, Bildern, Statusangaben und privaten Notizen – nur für den DM sichtbar."
            />
            <FeatureCard
              icon="🔗"
              title="Verbindungen & Netzwerke"
              description="Verknüpfe Charaktere mit Orten, ordne NPCs Organisationen zu und tagge beliebige Objekte gegenseitig per @-Erwähnung. Zusammenhänge auf einen Blick."
            />
            <FeatureCard
              icon="📖"
              title="Tagebuch & Geschichte"
              description="Spieler führen persönliche Tagebücher, der DM schreibt die offizielle Geschichte der Kampagne. Einträge lassen sich mit NPCs, Orten und Organisationen verknüpfen."
            />
            <FeatureCard
              icon="⚔️"
              title="Kampagnen & Teams"
              description="Erstelle mehrere Kampagnen und lade dein Team ein. Jede Kampagne hat ihren eigenen Bereich mit eigenen Daten, Spielern und Dungeon Masters."
            />
          </div>
        </div>
      </section>

      <Divider />

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="mx-auto max-w-3xl">
          <SectionTitle sub="In drei Schritten zu einer lebendigen, gemeinsam erlebten Welt.">
            So funktioniert Lorehub
          </SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {[
              {
                title: "Kampagne erstellen & Team einladen",
                text: "Lege eine neue Kampagne an und lade deine Mitspieler per Einladungslink ein. Jede Person bekommt ihre Rolle – Dungeon Master oder Spieler.",
              },
              {
                title: "Welt aufbauen & Objekte anlegen",
                text: "Erstelle NPCs, Locations, Organisationen und Charaktere. Verknüpfe sie miteinander, hinterlege Bilder und Hintergrundgeschichten – die Welt nimmt Form an.",
              },
              {
                title: "Geschichte schreiben & erleben",
                text: "Spieler führen nach jeder Session ihr Tagebuch, der DM ergänzt die offizielle Geschichte. Alles bleibt auffindbar über die Vollsuche – auch @-Erwähnungen.",
              },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <StepBadge n={i + 1} />
                <div style={{ paddingTop: "8px" }}>
                  <h3 className="font-cinzel font-bold mb-2" style={{ color: "var(--dnd-heading)", fontSize: "1rem" }}>
                    {step.title}
                  </h3>
                  <p style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", fontSize: "0.9rem", lineHeight: 1.65 }}>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── For DMs & Players ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="mx-auto max-w-5xl">
          <SectionTitle>Für Dungeon Masters & Spieler</SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {/* DM */}
            <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", padding: "32px 28px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🎲</div>
              <h3 className="font-cinzel font-bold mb-4" style={{ color: "var(--dnd-heading)", fontSize: "1.1rem" }}>
                Dungeon Masters
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Verwalte hunderte NPCs mit Status, Rasse und privaten Notizen",
                  "Baue deine Welt mit Locations, Reichen und Organisationen",
                  "Schreibe die offizielle Geschichte der Kampagne",
                  "Behalte private DM-Notizen – für Spieler unsichtbar",
                  "Vollsuche über alle Objekte, Einträge und @-Erwähnungen",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--dnd-red)", marginTop: "2px", flexShrink: 0 }}>✦</span>
                    <span style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", fontSize: "0.9rem" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Players */}
            <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", padding: "32px 28px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>⚔️</div>
              <h3 className="font-cinzel font-bold mb-4" style={{ color: "var(--dnd-heading)", fontSize: "1.1rem" }}>
                Spieler
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Führe ein persönliches Tagebuch deiner Abenteuer",
                  "Verwalte deinen Charakter mit Bild und Hintergrundgeschichte",
                  "Entdecke die Welt – NPCs, Orte und Organisationen",
                  "Verknüpfe Tagebucheinträge mit Personen und Orten",
                  "Behalte den Überblick über alle Geschehnisse",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--dnd-gold)", marginTop: "2px", flexShrink: 0 }}>✦</span>
                    <span style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", fontSize: "0.9rem" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="mx-auto max-w-3xl">
          <SectionTitle sub="Häufig gestellte Fragen zu Lorehub.">
            FAQ
          </SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              {
                q: "Was ist Lorehub?",
                a: "Lorehub ist ein digitales Kampagnen-Archiv für Pen-&-Paper-Rollenspiele wie Dungeons & Dragons. Es hilft Dungeon Masters und Spielern, ihre Kampagnenwelt zu verwalten – mit NPCs, Locations, Organisationen, Charakteren, einem Tagebuch-System und mehr.",
              },
              {
                q: "Für welche Rollenspiele ist Lorehub geeignet?",
                a: "Lorehub ist system-agnostisch und funktioniert mit jedem Pen-&-Paper-Rollenspiel: D&D 5e, Pathfinder, Das Schwarze Auge, Shadowrun, Vampire: The Masquerade und viele mehr.",
              },
              {
                q: "Können Spieler und DM gleichzeitig Lorehub nutzen?",
                a: "Ja. Der Dungeon Master verwaltet die Welt und schreibt die offizielle Geschichte. Spieler führen ihre eigenen Tagebücher und können ihren Charakter pflegen. Private DM-Notizen bleiben für Spieler unsichtbar.",
              },
              {
                q: "Wie funktioniert das @-Erwähnungs-System?",
                a: "In Tagebucheinträgen, Notizen und Beschreibungen kannst du mit @Name beliebige Objekte verknüpfen – NPCs, Orte, Organisationen oder Charaktere. Diese Verbindungen sind in der Vollsuche auffindbar und werden als klickbare Links angezeigt.",
              },
              {
                q: "Kann ich mehrere Kampagnen verwalten?",
                a: "Ja. Du kannst beliebig viele Kampagnen erstellen. Jede Kampagne hat ihren eigenen Bereich mit eigenem Team, eigenen NPCs, Locations und dem gesamten Tagebuch.",
              },
              {
                q: "Ist Lorehub kostenlos?",
                a: "Die Registrierung ist kostenlos. Du kannst sofort loslegen und deine erste Kampagne erstellen.",
              },
            ].map((faq, i) => (
              <details key={i} style={{ borderBottom: "1px solid var(--dnd-border)" }}>
                <summary className="font-cinzel" style={{
                  padding: "18px 0", cursor: "pointer", listStyle: "none",
                  color: "var(--dnd-heading)", fontSize: "0.95rem", letterSpacing: "0.02em",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  {faq.q}
                  <span style={{ color: "var(--dnd-red)", fontSize: "1.2rem", flexShrink: 0, marginLeft: 16 }}>+</span>
                </summary>
                <p style={{
                  padding: "0 0 18px 0",
                  color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif",
                  fontSize: "0.9rem", lineHeight: 1.7,
                }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--dnd-red-dark) 0%, #0E0E0E 60%)", opacity: 0.4 }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <div style={{ width: 48, height: 2, background: "var(--dnd-gold)", margin: "0 auto 28px", opacity: 0.7 }} />
          <h2 className="font-cinzel font-bold" style={{ color: "var(--dnd-heading)", fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "0.03em", marginBottom: "16px" }}>
            Bereit, deine Geschichte zu schreiben?
          </h2>
          <p style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", fontSize: "1rem", lineHeight: 1.7, marginBottom: "36px" }}>
            Erstelle dein kostenloses Konto und starte noch heute mit deiner ersten Kampagne.
          </p>
          {isLoggedIn ? (
            <Link href="/" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "14px 40px" }}>
              Zur App →
            </Link>
          ) : (
            <Link href="/registrieren" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "14px 40px" }}>
              Jetzt kostenlos registrieren
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
