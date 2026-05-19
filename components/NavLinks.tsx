"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const NAV = [
    { href: "/dashboard",      label: t("dashboard"),      prefix: "/dashboard", exact: true },
    { href: "/npc",            label: t("npcs"),           prefix: "/npc" },
    { href: "/organisationen", label: t("organisationen"), prefix: "/organisationen" },
    { href: "/locations",      label: t("locations"),      prefix: "/locations" },
    { href: "/charaktere",     label: t("charaktere"),     prefix: "/charaktere" },
    { href: "/geschichte",     label: t("geschichte"),     prefix: "/geschichte" },
    { href: "/tagebuch",       label: t("tagebuch"),       prefix: "/tagebuch" },
    { href: "/quests",         label: t("quests"),         prefix: "/quests" },
  ];

  return (
    <>
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.prefix : pathname.startsWith(item.prefix);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`ddb-nav-link${active ? " ddb-nav-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
