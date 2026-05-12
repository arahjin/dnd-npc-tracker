"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const NPCModal = dynamic(() => import("./NPCModal"));

type OrgMembership = { organisationId: string; rolle: string };

type Props = {
  id: string;
  name: string;
  availableOrgs: { id: string; name: string }[];
  initialOrgs: OrgMembership[];
  availableLocations?: { id: string; name: string }[];
  canSeePrivate?: boolean;
  initial: {
    name: string; image: string; status: string; beziehung: string;
    geschlecht: string; region: string; alter: string; rasse: string;
    herkunft: string; aktuellePosition: string; notizen: string;
    sichtbarkeit?: string; privateNotizen?: string;
  };
};

export default function NPCEditButton({ id, name, availableOrgs, initialOrgs, availableLocations = [], initial, canSeePrivate }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ddb-cta"
        style={{ background: "transparent", borderColor: "var(--dnd-gold)", color: "var(--dnd-gold)" }}
      >
        Bearbeiten
      </button>

      {open && (
        <NPCModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={`${name} bearbeiten`}
          id={id}
          availableOrgs={availableOrgs}
          initialOrgs={initialOrgs}
          availableLocations={availableLocations}
          initial={initial}
          canSeePrivate={canSeePrivate}
        />
      )}
    </>
  );
}
