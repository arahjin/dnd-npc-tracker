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
        pathname.startsWith("/email-bestaetigen") ||
        pathname.startsWith("/api/setup") ||
        pathname.startsWith("/api/registrieren") ||
        pathname.startsWith("/api/invite/check") ||
        pathname.startsWith("/api/auth/email-bestaetigen") ||
        pathname.startsWith("/api/auth/passwort-vergessen") ||
        pathname.startsWith("/api/auth/passwort-zuruecksetzen") ||
        pathname === "/api/setup/promote";

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      // Redirect unverified users to the verification waiting page
      const emailVerified = (auth?.user as { emailVerified?: boolean } | undefined)?.emailVerified ?? true;
      if (!emailVerified) {
        if (pathname.startsWith("/email-bestaetigen") || pathname.startsWith("/api/auth/email-bestaetigen-erneut")) return true;
        return Response.redirect(new URL("/email-bestaetigen/warten", request.nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
