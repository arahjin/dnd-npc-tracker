"use client";

import { useState } from "react";
import CharakterModal from "./CharakterModal";

type OrgMembership = { organisationId: string; rolle: string };

type Props = {
  id: string; name: string;
  availableOrgs: { id: string; name: string }[];
  initialOrgs: OrgMembership[];
  availableLocations?: { id: string; name: string }[];
  initial: {
    name: string; image: string; status: string; beziehung: string;
    geschlecht: string; region: string; alter: string; rasse: string;
    herkunft: string; aktuellePosition: string; gottheit: string; notizen: string;
  };
};

export default function CharakterEditButton({ id, name, availableOrgs, initialOrgs, availableLocations = [], initial }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta"
        style={{ background: "transparent", borderColor: "var(--dnd-gold)", color: "var(--dnd-gold)" }}>
        Bearbeiten
      </button>
      <CharakterModal isOpen={open} onClose={() => setOpen(false)}
        title={`${name} bearbeiten`} id={id}
        availableOrgs={availableOrgs} initialOrgs={initialOrgs}
        availableLocations={availableLocations} initial={initial} />
    </>
  );
}
