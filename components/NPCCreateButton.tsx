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
        className="font-cinzel text-sm font-semibold px-5 py-2.5 transition-all tracking-wider action-btn"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
      >
        + Person hinzufügen
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
