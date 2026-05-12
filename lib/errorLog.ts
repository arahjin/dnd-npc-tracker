import { prisma } from "./prisma";

/**
 * Persist a server-side error so admins can review it in /dm/admin.
 * Best-effort: failures here are swallowed so the original request handler
 * can still return its response.
 */
export async function logError(
  message: string,
  context?: unknown,
  userId?: string,
): Promise<void> {
  try {
    const ctxStr = context === undefined
      ? null
      : typeof context === "string"
        ? context
        : safeStringify(context);
    await prisma.errorLog.create({
      data: {
        message: message.slice(0, 2000),
        context: ctxStr?.slice(0, 8000) ?? null,
        userId: userId ?? null,
      },
    });
  } catch {
    // best-effort
  }
}

function safeStringify(v: unknown): string {
  try {
    if (v instanceof Error) return `${v.name}: ${v.message}\n${v.stack ?? ""}`;
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
