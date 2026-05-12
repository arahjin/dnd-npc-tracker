import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import JoinButton from "./JoinButton";

export default async function EinladenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [invite, session] = await Promise.all([
    prisma.invite.findUnique({
      where: { token },
      include: { kampagne: { select: { name: true, beschreibung: true } } },
    }),
    auth(),
  ]);

  if (!invite || !invite.isPermanent || !invite.kampagne) notFound();

  const isActive = invite.active;
  const isLoggedIn = !!session?.user;

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />

          <div className="px-8 py-10 space-y-6 text-center">
            <div>
              <p className="font-cinzel text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--dnd-text-muted)" }}>
                Einladung zur Kampagne
              </p>
              <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-heading)" }}>
                {invite.kampagne.name}
              </h1>
              {invite.kampagne.beschreibung && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--dnd-text-muted)", fontFamily: "var(--font-roboto), sans-serif" }}>
                  {invite.kampagne.beschreibung}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, var(--dnd-red))" }} />
              <span style={{ color: "var(--dnd-red)" }}>✦</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            </div>

            {isActive ? (
              <JoinButton token={token} isLoggedIn={isLoggedIn} />
            ) : (
              <p className="font-cinzel text-sm" style={{ color: "#F87171" }}>
                Dieser Einladungslink wurde deaktiviert.
              </p>
            )}
          </div>

          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--dnd-border), transparent)" }} />
        </div>

        <p className="mt-6 text-center font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
          <a href="/" style={{ color: "var(--dnd-text-muted)" }}>Lorehub</a>
        </p>
      </div>
    </main>
  );
}
