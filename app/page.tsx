import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Lorehub – Dein digitales Kampagnen-Archiv für Pen & Paper",
  description:
    "Lorehub hilft Dungeon Masters und Spielern, ihre Pen-&-Paper-Kampagnen zu verwalten: NPCs, Organisationen, Locations, Charaktere, Tagebuch und mehr – alles an einem Ort.",
};

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const gold = "var(--dnd-gold)";
const iconProps = { fill: "none", stroke: gold, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** NPCs, Orgs, Chars, Locations — stacked profile cards */
function IconObjekte() {
  return (
    <svg viewBox="0 0 56 56" width={52} height={52} {...iconProps}>
      {/* Back card */}
      <rect x="18" y="8" width="26" height="32" rx="2" stroke={gold} opacity="0.4" />
      {/* Front card */}
      <rect x="10" y="16" width="26" height="32" rx="2" fill="rgba(201,168,76,0.06)" stroke={gold} />
      {/* Portrait circle */}
      <circle cx="23" cy="26" r="5" stroke={gold} />
      {/* Name line */}
      <line x1="15" y1="35" x2="31" y2="35" stroke={gold} />
      {/* Sub line */}
      <line x1="15" y1="40" x2="27" y2="40" stroke={gold} opacity="0.6" />
      {/* Location pin top-right */}
      <circle cx="40" cy="10" r="3" stroke={gold} />
      <path d="M40 13 L40 18" stroke={gold} />
    </svg>
  );
}

/** Nodes connected by lines — network graph */
function IconVerbindungen() {
  return (
    <svg viewBox="0 0 56 56" width={52} height={52} {...iconProps}>
      {/* Three outer nodes */}
      <circle cx="28" cy="9"  r="5" stroke={gold} />
      <circle cx="9"  cy="43" r="5" stroke={gold} />
      <circle cx="47" cy="43" r="5" stroke={gold} />
      {/* Edges */}
      <line x1="28" y1="14" x2="13" y2="38" stroke={gold} />
      <line x1="28" y1="14" x2="43" y2="38" stroke={gold} />
      <line x1="14" y1="43" x2="42" y2="43" stroke={gold} />
      {/* Central node */}
      <circle cx="28" cy="30" r="3.5" fill="rgba(201,168,76,0.25)" stroke={gold} />
      {/* Edges to center */}
      <line x1="28" y1="14" x2="28" y2="26.5" stroke={gold} strokeDasharray="2 2" opacity="0.5" />
      <line x1="13" y1="40" x2="25" y2="32" stroke={gold} strokeDasharray="2 2" opacity="0.5" />
      <line x1="43" y1="40" x2="31" y2="32" stroke={gold} strokeDasharray="2 2" opacity="0.5" />
    </svg>
  );
}

/** Open book with quill */
function IconTagebuch() {
  return (
    <svg viewBox="0 0 56 56" width={52} height={52} {...iconProps}>
      {/* Left page */}
      <path d="M28 12 L10 17 L10 46 L28 42 Z" fill="rgba(201,168,76,0.06)" stroke={gold} />
      {/* Right page */}
      <path d="M28 12 L46 17 L46 46 L28 42 Z" fill="rgba(201,168,76,0.04)" stroke={gold} />
      {/* Spine */}
      <line x1="28" y1="12" x2="28" y2="42" stroke={gold} />
      {/* Lines left page */}
      <line x1="14" y1="24" x2="25" y2="22" stroke={gold} opacity="0.7" />
      <line x1="14" y1="29" x2="25" y2="27" stroke={gold} opacity="0.7" />
      <line x1="14" y1="34" x2="22" y2="32" stroke={gold} opacity="0.5" />
      {/* Lines right page */}
      <line x1="31" y1="22" x2="42" y2="24" stroke={gold} opacity="0.7" />
      <line x1="31" y1="27" x2="42" y2="29" stroke={gold} opacity="0.7" />
      {/* Quill */}
      <path d="M46 8 Q52 4 54 8 Q50 14 46 18 Z" fill="rgba(201,168,76,0.2)" stroke={gold} strokeWidth={1.2} />
      <line x1="47" y1="17" x2="43" y2="26" stroke={gold} strokeWidth={1.2} />
    </svg>
  );
}

/** Shield with sword — campaigns */
function IconKampagnen() {
  return (
    <svg viewBox="0 0 56 56" width={52} height={52} {...iconProps}>
      {/* Shield */}
      <path d="M28 7 L47 15 L47 30 Q47 44 28 52 Q9 44 9 30 L9 15 Z"
        fill="rgba(201,168,76,0.06)" stroke={gold} />
      {/* Sword blade */}
      <line x1="28" y1="19" x2="28" y2="41" stroke={gold} strokeWidth={2} />
      {/* Guard */}
      <line x1="22" y1="27" x2="34" y2="27" stroke={gold} strokeWidth={1.5} />
      {/* Pommel */}
      <circle cx="28" cy="43" r="2.5" fill="rgba(201,168,76,0.3)" stroke={gold} />
      {/* Tip */}
      <path d="M26 19 L30 19 L28 15 Z" fill="rgba(201,168,76,0.4)" stroke={gold} strokeWidth={1} />
    </svg>
  );
}

/** D20 die — Dungeon Master */
function IconDM() {
  return (
    <svg viewBox="0 0 56 56" width={52} height={52} {...iconProps}>
      {/* Outer hexagon */}
      <polygon points="28,6 50,19 50,38 28,51 6,38 6,19"
        fill="rgba(201,168,76,0.06)" stroke={gold} />
      {/* Inner triangle top */}
      <polygon points="28,6 50,19 6,19" fill="rgba(201,168,76,0.1)" stroke={gold} strokeWidth={1} />
      {/* Face lines */}
      <line x1="6"  y1="19" x2="28" y2="27" stroke={gold} opacity="0.5" strokeWidth={1} />
      <line x1="50" y1="19" x2="28" y2="27" stroke={gold} opacity="0.5" strokeWidth={1} />
      <line x1="6"  y1="38" x2="28" y2="27" stroke={gold} opacity="0.5" strokeWidth={1} />
      <line x1="50" y1="38" x2="28" y2="27" stroke={gold} opacity="0.5" strokeWidth={1} />
      {/* "20" text */}
      <text x="28" y="37" textAnchor="middle" fontSize="11" fontFamily="var(--font-oswald), sans-serif"
        fill={gold} stroke="none" fontWeight="600" letterSpacing="1">20</text>
    </svg>
  );
}

/** Crossed swords — Players */
function IconSpieler() {
  return (
    <svg viewBox="0 0 56 56" width={52} height={52} {...iconProps}>
      {/* Sword 1 — top-left to bottom-right */}
      <line x1="12" y1="12" x2="44" y2="44" stroke={gold} strokeWidth={2} />
      {/* Tip 1 */}
      <path d="M10 10 L14 10 L14 14 Z" fill="rgba(201,168,76,0.5)" stroke={gold} strokeWidth={1} />
      {/* Guard 1 */}
      <line x1="18" y1="22" x2="28" y2="12" stroke={gold} strokeWidth={1.5} />
      {/* Pommel 1 */}
      <circle cx="44" cy="44" r="3" fill="rgba(201,168,76,0.3)" stroke={gold} />

      {/* Sword 2 — top-right to bottom-left */}
      <line x1="44" y1="12" x2="12" y2="44" stroke={gold} strokeWidth={2} />
      {/* Tip 2 */}
      <path d="M46 10 L42 10 L42 14 Z" fill="rgba(201,168,76,0.5)" stroke={gold} strokeWidth={1} />
      {/* Guard 2 */}
      <line x1="38" y1="22" x2="28" y2="12" stroke={gold} strokeWidth={1.5} />
      {/* Pommel 2 */}
      <circle cx="12" cy="44" r="3" fill="rgba(201,168,76,0.3)" stroke={gold} />
    </svg>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FeatureCard({
  icon, title, description,
}: { icon: React.ReactNode; title: string; description: string }) {
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

      <div style={{ marginBottom: "16px" }}>{icon}</div>
      <h3 className="font-cinzel font-bold mb-3" style={{ color: "var(--dnd-heading)", fontSize: "1.05rem", letterSpacing: "0.04em" }}>
        {title}
      </h3>
      <p style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif", fontSize: "0.9rem", lineHeight: 1.65 }}>
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
      {sub && <p className="mt-3 text-sm" style={{ color: "var(--dnd-text-muted)", fontFamily: "var(--font-roboto), sans-serif", maxWidth: 560, margin: "12px auto 0" }}>{sub}</p>}
      <div style={{ width: 48, height: 2, background: "var(--dnd-red)", margin: "16px auto 0" }} />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function StartPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const t = await getTranslations("landing");

  let settings = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch { /* fallback */ }

  const subtitle = settings?.landingSubtitle || t("hero.subtitle");
  const bodyText = settings?.landingBody || "";
  const paragraphs = bodyText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div style={{ background: "var(--dnd-bg)" }}>

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <header style={{ background: "rgba(10,10,10,0.95)", borderBottom: "1px solid #2A2A2A", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6" style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/">
            <Image
              src="/lorehub_logo.png"
              alt="Lorehub"
              width={280} height={80}
              className="object-contain"
              style={{ height: "46px", width: "auto", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
            />
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isLoggedIn ? (
              <Link href="/npc" className="ddb-cta" style={{ padding: "8px 20px", fontSize: "0.75rem" }}>{t("nav.toApp")}</Link>
            ) : (
              <>
                <Link href="/login" className="font-cinzel text-xs tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.6)", padding: "8px 16px", textDecoration: "none" }}>
                  {t("nav.signIn")}
                </Link>
                <Link href="/registrieren" className="ddb-cta" style={{ padding: "8px 20px", fontSize: "0.75rem" }}>
                  {t("nav.startFree")}
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

        {/* Content — tight group, vertically centered */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px", gap: "16px" }}>
          <Image
            src="/lorehub_logo.png"
            alt="Lorehub"
            width={560} height={160}
            className="object-contain"
            style={{ width: "clamp(280px, 48vw, 560px)", height: "auto", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.8))" }}
            priority
          />

          {subtitle && (
            <p className="font-cinzel" style={{
              color: "var(--dnd-gold)", fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
              letterSpacing: "0.1em", maxWidth: 580,
            }}>
              {subtitle}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div style={{ maxWidth: 580 }}>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  {p}
                </p>
              ))}
            </div>
          )}

          {isLoggedIn ? (
            <Link href="/npc" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "13px 38px", marginTop: "8px" }}>
              {t("hero.toApp")}
            </Link>
          ) : (
            <Link href="/registrieren" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "13px 38px", marginTop: "8px", display: "inline-block" }}>
              {t("hero.startFree")}
            </Link>
          )}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="mx-auto max-w-6xl">
          <SectionTitle sub={t("features.sub")}>
            {t("features.title")}
          </SectionTitle>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
            <FeatureCard icon={<IconObjekte />} title={t("features.card1Title")} description={t("features.card1Desc")} />
            <FeatureCard icon={<IconVerbindungen />} title={t("features.card2Title")} description={t("features.card2Desc")} />
            <FeatureCard icon={<IconTagebuch />} title={t("features.card3Title")} description={t("features.card3Desc")} />
            <FeatureCard icon={<IconKampagnen />} title={t("features.card4Title")} description={t("features.card4Desc")} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="mx-auto max-w-3xl">
          <SectionTitle sub={t("how.sub")}>
            {t("how.title")}
          </SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {[
              { title: t("how.step1Title"), text: t("how.step1Text") },
              { title: t("how.step2Title"), text: t("how.step2Text") },
              { title: t("how.step3Title"), text: t("how.step3Text") },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <StepBadge n={i + 1} />
                <div style={{ paddingTop: "8px" }}>
                  <h3 className="font-cinzel font-bold mb-2" style={{ color: "var(--dnd-heading)", fontSize: "1rem" }}>
                    {step.title}
                  </h3>
                  <p style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif", fontSize: "0.9rem", lineHeight: 1.65 }}>
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
          <SectionTitle>{t("roles.title")}</SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {/* DM */}
            <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", padding: "32px 28px" }}>
              <div style={{ marginBottom: "16px" }}><IconDM /></div>
              <h3 className="font-cinzel font-bold mb-4" style={{ color: "var(--dnd-heading)", fontSize: "1.1rem" }}>
                {t("roles.dmTitle")}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[t("roles.dm1"), t("roles.dm2"), t("roles.dm3"), t("roles.dm4"), t("roles.dm5")].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--dnd-red)", marginTop: "2px", flexShrink: 0 }}>✦</span>
                    <span style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif", fontSize: "0.9rem" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Players */}
            <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", padding: "32px 28px" }}>
              <div style={{ marginBottom: "16px" }}><IconSpieler /></div>
              <h3 className="font-cinzel font-bold mb-4" style={{ color: "var(--dnd-heading)", fontSize: "1.1rem" }}>
                {t("roles.playerTitle")}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[t("roles.player1"), t("roles.player2"), t("roles.player3"), t("roles.player4"), t("roles.player5")].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--dnd-gold)", marginTop: "2px", flexShrink: 0 }}>✦</span>
                    <span style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif", fontSize: "0.9rem" }}>{item}</span>
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
          <SectionTitle sub={t("faq.sub")}>
            {t("faq.title")}
          </SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {([1, 2, 3, 4, 5, 6] as const).map((n, i) => ({
              q: t(`faq.q${n}` as Parameters<typeof t>[0]),
              a: t(`faq.a${n}` as Parameters<typeof t>[0]),
              i,
            })).map(({ q, a, i }) => (
              <details key={i} style={{ borderBottom: "1px solid var(--dnd-border)" }}>
                <summary className="font-cinzel" style={{
                  padding: "18px 0", cursor: "pointer", listStyle: "none",
                  color: "var(--dnd-heading)", fontSize: "0.95rem", letterSpacing: "0.02em",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  {q}
                  <span style={{ color: "var(--dnd-red)", fontSize: "1.2rem", flexShrink: 0, marginLeft: 16 }}>+</span>
                </summary>
                <p style={{
                  padding: "0 0 18px 0",
                  color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif",
                  fontSize: "0.9rem", lineHeight: 1.7,
                }}>
                  {a}
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
            {t("cta.title")}
          </h2>
          <p style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif", fontSize: "1rem", lineHeight: 1.7, marginBottom: "36px" }}>
            {t("cta.text")}
          </p>
          {isLoggedIn ? (
            <Link href="/npc" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "14px 40px" }}>
              {t("cta.toApp")}
            </Link>
          ) : (
            <Link href="/registrieren" className="ddb-cta" style={{ fontSize: "0.9rem", padding: "14px 40px" }}>
              {t("cta.startFree")}
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
