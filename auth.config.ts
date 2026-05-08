import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic = pathname.startsWith("/login") || pathname.startsWith("/registrieren");
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
