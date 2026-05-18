"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const CharakterModal = dynamic(() => import("./CharakterModal"));

type OrgMembership = { organisationId: string; rolle: string };

type Props = {
  id: string; name: string;
  availableOrgs: { id: string; name: string }[];
  initialOrgs: OrgMembership[];
  availableLocations?: { id: string; name: string }[];
  canSeePrivate?: boolean;
  initial: {
    name: string; image: string; status: string; beziehung: string;
    geschlecht: string; region: string; alter: string; rasse: string;
    herkunft: string; aktuellePosition: string; gottheit: string; notizen: string;
    sichtbarkeit?: string; privateNotizen?: string;
  };
  availableUsers?: { id: string; name: string | null }[];
  initialUserId?: string;
  canChangeOwner?: boolean;
};

export default function CharakterEditButton({ id, name, availableOrgs, initialOrgs, availableLocations = [], initial, canSeePrivate, availableUsers, initialUserId, canChangeOwner }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("common");
  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta"
        style={{ background: "transparent", borderColor: "var(--dnd-gold)", color: "var(--dnd-gold)" }}>
        {t("edit")}
      </button>
      {open && (
        <CharakterModal isOpen={open} onClose={() => setOpen(false)}
          title={t("editName", { name })} id={id}
          availableOrgs={availableOrgs} initialOrgs={initialOrgs}
          availableLocations={availableLocations} initial={initial} canSeePrivate={canSeePrivate}
          availableUsers={availableUsers} initialUserId={initialUserId} canChangeOwner={canChangeOwner} />
      )}
    </>
  );
}
