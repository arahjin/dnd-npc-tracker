"use client";

import { useState } from "react";
import NPCModal from "./NPCModal";

type OrgMembership = { organisationId: string; rolle: string };

type Props = {
  id: string;
  name: string;
  availableOrgs: { id: string; name: string }[];
  initialOrgs: OrgMembership[];
  initial: {
    name: string; image: string; status: string; beziehung: string;
    geschlecht: string; region: string; alter: string; rasse: string;
    herkunft: string; aktuellePosition: string; notizen: string;
  };
};

export default function NPCEditButton({ id, name, availableOrgs, initialOrgs, initial }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
        style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-heading)" }}
      >
        BEARBEITEN
      </button>

      <NPCModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`${name} bearbeiten`}
        id={id}
        availableOrgs={availableOrgs}
        initialOrgs={initialOrgs}
        initial={initial}
      />
    </>
  );
}
