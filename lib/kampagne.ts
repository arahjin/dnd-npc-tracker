import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "./prisma";

export type KampagneCtx = {
  kampagneId: string;
  userId: string;
  isDM: boolean;
  isAdmin: boolean;
  kampagneName: string;
};

/** Use in Server Components / Pages. Redirects to /kampagnen if no valid campaign. */
export async function requireKampagne(): Promise<KampagneCtx> {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === "ADMIN";

  const cookieStore = await cookies();
  const kampagneId = cookieStore.get("aktiveKampagne")?.value ?? null;

  if (!kampagneId) redirect("/kampagnen");

  if (isAdmin) {
    const kampagne = await prisma.kampagne.findUnique({
      where: { id: kampagneId },
      select: { id: true, name: true },
    });
    if (!kampagne) redirect("/kampagnen");
    return { kampagneId, userId, isDM: true, isAdmin: true, kampagneName: kampagne.name };
  }

  const mitglied = await prisma.kampagneMitglied.findUnique({
    where: { kampagneId_userId: { kampagneId, userId } },
    include: { kampagne: { select: { name: true } } },
  });
  if (!mitglied) redirect("/kampagnen");

  return {
    kampagneId,
    userId,
    isDM: mitglied.isDM,
    isAdmin: false,
    kampagneName: mitglied.kampagne.name,
  };
}

/** Use in API route handlers. Returns null on failure (caller sends 401/403). */
export async function requireKampagneApi(): Promise<KampagneCtx | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  const cookieStore = await cookies();
  const kampagneId = cookieStore.get("aktiveKampagne")?.value ?? null;
  if (!kampagneId) return null;

  if (isAdmin) {
    const kampagne = await prisma.kampagne.findUnique({
      where: { id: kampagneId },
      select: { id: true, name: true },
    });
    if (!kampagne) return null;
    return { kampagneId, userId, isDM: true, isAdmin: true, kampagneName: kampagne.name };
  }

  const mitglied = await prisma.kampagneMitglied.findUnique({
    where: { kampagneId_userId: { kampagneId, userId } },
    include: { kampagne: { select: { name: true } } },
  });
  if (!mitglied) return null;

  return {
    kampagneId,
    userId,
    isDM: mitglied.isDM,
    isAdmin: false,
    kampagneName: mitglied.kampagne.name,
  };
}

/** Fetch all campaigns a user belongs to (for campaign selector). */
export async function getUserKampagnen(userId: string, isAdmin: boolean) {
  if (isAdmin) {
    return prisma.kampagne.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });
  }
  const mitglieder = await prisma.kampagneMitglied.findMany({
    where: { userId },
    include: { kampagne: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return mitglieder.map((m) => m.kampagne);
}
