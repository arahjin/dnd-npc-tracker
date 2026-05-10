import { prisma } from "./prisma";
import type { KampagneCtx } from "./kampagne";

/**
 * Loads a quest's auth-relevant fields and verifies it belongs to the user's
 * active campaign. Returns the quest stub on success, or null if not found / wrong campaign.
 */
export async function loadQuestForAuth(questId: string, ctx: KampagneCtx) {
  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    select: { id: true, kampagneId: true, erstellerId: true, sichtbarkeit: true },
  });
  if (!quest) return null;
  if (quest.kampagneId !== ctx.kampagneId) return null;
  return quest;
}

/** Quest write access: DM, Admin, or quest creator. */
export function canManageQuest(
  ctx: { isDM: boolean; isAdmin: boolean; userId: string },
  quest: { erstellerId: string | null },
) {
  return ctx.isDM || ctx.isAdmin || quest.erstellerId === ctx.userId;
}
