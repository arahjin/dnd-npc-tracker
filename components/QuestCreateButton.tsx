"use client";

import { useState } from "react";
import QuestModal from "./QuestModal";

export default function QuestCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Quest
      </button>
      {/* Mounted only when open → relations API fetched lazily on first click */}
      {open && (
        <QuestModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Neue Quest erstellen"
          canSeePrivate={true}
        />
      )}
    </>
  );
}
