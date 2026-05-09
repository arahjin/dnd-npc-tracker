"use client";

import { useState } from "react";
import NPCModal from "./NPCModal";

type Props = {
  availableOrgs: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
};

export default function NPCCreateButton({ availableOrgs, availableLocations = [] }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ddb-cta"
      >
        + NPC
      </button>

      <NPCModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Neuen NPC erstellen"
        availableOrgs={availableOrgs}
        availableLocations={availableLocations}
      />
    </>
  );
}
