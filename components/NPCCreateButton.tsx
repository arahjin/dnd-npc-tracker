"use client";

import { useState } from "react";
import NPCModal from "./NPCModal";

type Props = {
  availableOrgs: { id: string; name: string }[];
};

export default function NPCCreateButton({ availableOrgs }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-cinzel text-sm font-semibold px-5 py-2.5 transition-all tracking-wider"
        style={{
          background: "var(--dnd-red)",
          color: "#F5EDD6",
          border: "1px solid var(--dnd-red-dark)",
          clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
        }}
      >
        + NPC hinzufügen
      </button>

      <NPCModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Neuen NPC erstellen"
        availableOrgs={availableOrgs}
      />
    </>
  );
}
