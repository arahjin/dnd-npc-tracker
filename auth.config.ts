import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/registrieren") ||
        pathname.startsWith("/setup") ||
        pathname.startsWith("/passwort-vergessen") ||
        pathname.startsWith("/passwort-zuruecksetzen") ||
        pathname.startsWith("/impressum") ||
        pathname.startsWith("/datenschutz") ||
        pathname.startsWith("/start") ||
        pathname.startsWith("/api/setup") ||
        pathname.startsWith("/api/registrieren") ||
        pathname.startsWith("/api/invite/check") ||
        pathname.startsWith("/api/auth/passwort-vergessen") ||
        pathname.startsWith("/api/auth/passwort-zuruecksetzen") ||
        pathname === "/api/setup/promote" ||
        (pathname === "/api/site-settings" && request.method === "GET");

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
