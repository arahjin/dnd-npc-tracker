import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic = pathname.startsWith("/login") || pathname.startsWith("/registrieren") || pathname.startsWith("/setup") || pathname.startsWith("/api/setup") || pathname.startsWith("/api/registrieren") || pathname.startsWith("/api/invite/check") || pathname === "/api/setup/promote";
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
