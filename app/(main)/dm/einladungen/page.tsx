import { requireKampagne } from "@/lib/kampagne";
import EinladungenClient from "./EinladungenClient";

export default async function EinladungenPage() {
  const ctx = await requireKampagne();
  const canInviteDM = ctx.isAdmin || ctx.isOwner;
  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <EinladungenClient canInviteDM={canInviteDM} />
    </main>
  );
}
