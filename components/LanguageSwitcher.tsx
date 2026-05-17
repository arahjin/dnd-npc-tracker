"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher({ initialLocale }: { initialLocale: string }) {
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Derive current locale from cookie on client (after hydration) or from prop
  const current = typeof document !== "undefined"
    ? (document.cookie.match(/(?:^|;\s*)locale=([^;]*)/))?.[1] ?? initialLocale
    : initialLocale;

  async function setLocale(locale: string) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      style={{ display: "flex", gap: 2, alignItems: "center", opacity: pending ? 0.6 : 1 }}
    >
      {(["de", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          disabled={pending}
          className="font-cinzel text-xs"
          style={{
            padding: "2px 8px",
            border: "1px solid",
            borderColor: current === l ? "var(--dnd-gold)" : "#333",
            color: current === l ? "var(--dnd-gold)" : "#9A8A78",
            background: current === l ? "rgba(212,175,55,0.1)" : "transparent",
            cursor: pending ? "default" : "pointer",
            letterSpacing: "0.1em",
            transition: "all 0.15s",
          }}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
