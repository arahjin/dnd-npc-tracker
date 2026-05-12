import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NavLinks from "./NavLinks";
import NavSearch from "./NavSearch";
import UserMenu from "./UserMenu";
import KampagneSelector from "./KampagneSelector";
import MobileNav from "./MobileNav";

export default async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  let kampagneSelector: React.ReactNode = null;
  let isDMofActive = false;
  let kampagneNavData: { aktiveId: string; aktiveKampagne: string; kampagnen: { id: string; name: string }[] } | undefined;
  let errorCount = 0;

  if (user?.role === "ADMIN") {
    errorCount = await prisma.errorLog.count({ where: { resolved: false } });
  }

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
    <header className="site-header" style={{ position: "relative" }}>
      {/* ── Background image ── */}
      <Image
        src="/lorehub_header.png"
        alt=""
        fill
        className="object-cover object-top"
        priority
        style={{ zIndex: 0 }}
      />

      {/* ── Gradient overlay ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.45) 55%, transparent 100%)",
      }} />

      {/* ── Top accent line ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px", zIndex: 3,
        background: "linear-gradient(90deg, transparent, var(--dnd-gold) 40%, var(--dnd-gold) 60%, transparent)",
      }} />

      {/* ── Single nav row: Logo | Nav links | Search + User ── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6"
          style={{ display: "flex", alignItems: "stretch", height: "68px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", marginRight: "8px", flexShrink: 0 }}>
            <Image
              src="/lorehub_logo.png"
              alt="Lorehub"
              width={280} height={80}
              className="object-contain"
              style={{ height: "54px", width: "auto", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
            />
          </Link>

          {/* Desktop nav links — same row as logo */}
          <nav className="hidden md:flex" style={{ alignItems: "stretch" }}>
            <NavLinks />
          </nav>

          <div style={{ flex: 1 }} />

          {/* Desktop: search + campaign + user */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "10px" }}>
            <NavSearch />
            {kampagneSelector}
            {user && <UserMenu name={user.name ?? "Spieler"} role={user.role ?? "SPIELER"} isDM={isDMofActive} errorCount={errorCount} />}
          </div>

          {/* Mobile: hamburger */}
          <div className="flex md:hidden" style={{ alignItems: "center", gap: "4px" }}>
            <NavSearch compact />
            <MobileNav
              userName={user?.name ?? undefined}
              userRole={user?.role}
              isDM={isDMofActive}
              kampagneData={kampagneNavData}
            />
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
