ALTER TABLE "Invite" ADD COLUMN "isPermanent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Invite" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "Invite_kampagneId_isPermanent_active_idx" ON "Invite"("kampagneId", "isPermanent", "active");
