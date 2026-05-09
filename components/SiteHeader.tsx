import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NavSearch from "./NavSearch";
import UserMenu from "./UserMenu";
import KampagneSelector from "./KampagneSelector";
import MobileNav from "./MobileNav";

export default async function SiteHeader({ active }: {
  active: "npcs" | "organisationen" | "locations" | "charaktere" | "geschichte" | "tagebuch";
}) {
  const session = await auth();
  const user = session?.user as { name?: string | null; role?: string; id?: string } | undefined;

  let kampagneSelector: React.ReactNode = null;
  let isDMofActive = false;
  let kampagneNavData: { aktiveId: string; aktiveKampagne: string; kampagnen: { id: string; name: string }[] } | undefined;

  if (user?.id) {
    const cookieStore = await cookies();
    const aktiveId = cookieStore.get("aktiveKampagne")?.value ?? null;
    if (aktiveId) {
      const isAdmin = user.role === "ADMIN";
      const [aktive, kampagnen, mitglied] = await Promise.all([
        prisma.kampagne.findUnique({ where: { id: aktiveId }, select: { id: true, name: true } }),
        isAdmin
          ? prisma.kampagne.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } })
          : prisma.kampagneMitglied.findMany({
              where: { userId: user.id },
              include: { kampagne: { select: { id: true, name: true } } },
              orderBy: { createdAt: "asc" },
            }).then((ms) => ms.map((m) => m.kampagne)),
        isAdmin
          ? Promise.resolve(null)
          : prisma.kampagneMitglied.findUnique({
              where: { kampagneId_userId: { kampagneId: aktiveId, userId: user.id } },
              select: { isDM: true },
            }),
      ]);
      isDMofActive = isAdmin || mitglied?.isDM === true;
      if (aktive) {
        kampagneSelector = (
          <KampagneSelector aktiveId={aktiveId} aktiveKampagne={aktive.name} kampagnen={kampagnen} />
        );
        kampagneNavData = { aktiveId, aktiveKampagne: aktive.name, kampagnen };
      }
    }
  }

  return (
    <header className="site-header" style={{ position: "relative", overflow: "hidden" }}>
      {/* ── Background image ── */}
      <Image
        src="/lorehub_header.png"
        alt=""
        fill
        className="object-cover object-top"
        priority
        style={{ zIndex: 0 }}
      />

      {/* ── Gradient overlay: dark at top for nav legibility, fades to transparent ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.45) 55%, transparent 100%)",
      }} />

      {/* ── Top accent line ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px", zIndex: 3,
        background: "linear-gradient(90deg, transparent, var(--dnd-gold) 40%, var(--dnd-gold) 60%, transparent)",
      }} />

      {/* ── All nav content — positioned over the image ── */}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* Top row: Logo + Search + User */}
        <div className="mx-auto max-w-7xl px-4 md:px-6"
          style={{ display: "flex", alignItems: "center", height: "68px", gap: "12px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image
              src="/lorehub_logo.png"
              alt="Lorehub"
              width={140} height={63}
              className="object-contain"
              style={{ width: "clamp(90px, 18vw, 140px)", height: "auto", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
            />
          </Link>

          <div style={{ flex: 1 }} />

          {/* Desktop: search + campaign + user */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "10px" }}>
            <NavSearch />
            {kampagneSelector}
            {user && <UserMenu name={user.name ?? "Spieler"} role={user.role ?? "SPIELER"} isDM={isDMofActive} />}
          </div>

          {/* Mobile: hamburger */}
          <div className="flex md:hidden" style={{ alignItems: "center", gap: "4px" }}>
            <NavSearch compact />
            <MobileNav
              active={active}
              userName={user?.name ?? undefined}
              userRole={user?.role}
              isDM={isDMofActive}
              kampagneData={kampagneNavData}
            />
          </div>
        </div>

        {/* Nav links row — desktop only, sits on the image */}
        <div className="hidden md:block">
          <div className="mx-auto max-w-7xl px-4 md:px-6" style={{ display: "flex", alignItems: "stretch" }}>
            <Link href="/"               className={`ddb-nav-link${active === "npcs"           ? " ddb-nav-active" : ""}`}>NPCs</Link>
            <Link href="/organisationen" className={`ddb-nav-link${active === "organisationen"  ? " ddb-nav-active" : ""}`}>Organisationen</Link>
            <Link href="/locations"      className={`ddb-nav-link${active === "locations"       ? " ddb-nav-active" : ""}`}>Locations</Link>
            <Link href="/charaktere"     className={`ddb-nav-link${active === "charaktere"      ? " ddb-nav-active" : ""}`}>Charaktere</Link>
            <Link href="/geschichte"     className={`ddb-nav-link${active === "geschichte"      ? " ddb-nav-active" : ""}`}>Geschichte</Link>
            <Link href="/tagebuch"       className={`ddb-nav-link${active === "tagebuch"        ? " ddb-nav-active" : ""}`}>Tagebuch</Link>
          </div>
        </div>

      </div>

      {/* ── Bottom gold accent ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", zIndex: 3,
        background: "linear-gradient(90deg, transparent, var(--dnd-gold) 30%, var(--dnd-gold) 70%, transparent)",
      }} />
    </header>
  );
}
