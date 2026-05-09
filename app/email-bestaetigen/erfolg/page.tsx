"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function EmailErfolgPage() {
  // Sign out so the next login refreshes the JWT with emailVerified: true
  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      setTimeout(() => { window.location.href = "/login?verified=1"; }, 2000);
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dnd-bg)" }}>
      <div className="w-full max-w-md px-4 text-center">
        <div className="flex justify-center mb-8">
          <Image src="/wildgipfel_logo.png" alt="Wildgipfel" width={200} height={90} className="object-contain"
            style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9))" }} />
        </div>
        <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
          <div className="p-8">
            <p className="text-4xl mb-4">✓</p>
            <h1 className="font-cinzel text-xl font-bold mb-3" style={{ color: "#4ADE80" }}>
              E-Mail bestätigt!
            </h1>
            <p className="text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              Du wirst gleich zur Anmeldung weitergeleitet...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
