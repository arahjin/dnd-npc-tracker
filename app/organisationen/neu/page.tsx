export const dynamic = "force-dynamic";

import OrgForm from "@/components/OrgForm";
import { requireKampagne } from "@/lib/kampagne";
import SiteHeader from "@/components/SiteHeader";

export default async function NewOrganisation() {
  await requireKampagne();

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="organisationen" />
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-heading)" }}>Neue Organisation</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <OrgForm />
      </div>
    </main>
  );
}
