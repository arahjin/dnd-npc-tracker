import type { KampagneCtx } from "./kampagne";

export function visibilityWhere(ctx: KampagneCtx) {
  if (ctx.isDM || ctx.isAdmin) return {};
  return { OR: [{ sichtbarkeit: "public" }, { erstellerId: ctx.userId }] };
}

export function charakterVisibilityWhere(ctx: KampagneCtx) {
  if (ctx.isDM || ctx.isAdmin) return {};
  return { OR: [{ sichtbarkeit: "public" }, { userId: ctx.userId }] };
}

export function canSeePrivate(
  ctx: { userId: string; isDM: boolean; isAdmin: boolean },
  erstellerId: string | null | undefined,
) {
  return ctx.isDM || ctx.isAdmin || erstellerId === ctx.userId;
}
