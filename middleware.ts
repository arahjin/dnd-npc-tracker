import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Same-origin guard for state-changing API requests (CSRF mitigation).
 *
 * For POST/PUT/PATCH/DELETE under /api/*, the Origin header (preferred) or
 * Referer must match the request host. This blocks classic cross-site form
 * POSTs and cross-origin fetch attacks. NextAuth's own /api/auth/* routes
 * are excluded by the route matcher and handle CSRF themselves.
 */
function isSameOrigin(req: NextRequest): boolean {
  if (!STATE_CHANGING_METHODS.has(req.method)) return true;
  if (!req.nextUrl.pathname.startsWith("/api/")) return true;

  const host = req.headers.get("host");
  if (!host) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  // Fallback to Referer when Origin is missing (some same-origin tools strip it)
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  // No Origin AND no Referer on a state-changing API call: reject.
  return false;
}

export default auth((req) => {
  if (!isSameOrigin(req as unknown as NextRequest)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|lorehub|lorehub_logo).*)"],
};
