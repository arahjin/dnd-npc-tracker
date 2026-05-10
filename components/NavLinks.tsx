"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/npc",            label: "NPCs",           prefix: "/npc" },
  { href: "/organisationen", label: "Organisationen", prefix: "/organisationen" },
  { href: "/locations",      label: "Locations",      prefix: "/locations" },
  { href: "/charaktere",     label: "Charaktere",     prefix: "/charaktere" },
  { href: "/geschichte",     label: "Geschichte",     prefix: "/geschichte" },
  { href: "/tagebuch",       label: "Tagebuch",       prefix: "/tagebuch" },
  { href: "/quests",         label: "Quests",         prefix: "/quests" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`ddb-nav-link${pathname.startsWith(item.prefix) ? " ddb-nav-active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
