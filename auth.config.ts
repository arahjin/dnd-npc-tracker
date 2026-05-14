import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/registrieren") ||
        pathname.startsWith("/setup") ||
        pathname.startsWith("/passwort-vergessen") ||
        pathname.startsWith("/passwort-zuruecksetzen") ||
        pathname.startsWith("/impressum") ||
        pathname.startsWith("/datenschutz") ||
        pathname.startsWith("/start") ||
        pathname.startsWith("/einladen") ||
        pathname.startsWith("/api/setup") ||
        pathname.startsWith("/api/registrieren") ||
        pathname.startsWith("/api/invite/check") ||
        pathname.startsWith("/api/account/passwort-vergessen") ||
        pathname.startsWith("/api/account/passwort-zuruecksetzen") ||
        pathname.startsWith("/api/account/email-bestaetigen") ||
        (pathname === "/api/site-settings" && request.method === "GET");

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      // Logged in but email not yet verified → hold at verification waiting page
      const emailVerified = (auth?.user as { emailVerified?: boolean })?.emailVerified ?? true;
      if (!emailVerified && !pathname.startsWith("/email-bestaetigen")) {
        return Response.redirect(new URL("/email-bestaetigen/warten", request.url));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
