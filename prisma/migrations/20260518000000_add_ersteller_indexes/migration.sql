-- CreateIndex
CREATE INDEX "NPC_erstellerId_idx" ON "NPC"("erstellerId");

-- CreateIndex
CREATE INDEX "Organisation_erstellerId_idx" ON "Organisation"("erstellerId");

-- CreateIndex
CREATE INDEX "Location_erstellerId_idx" ON "Location"("erstellerId");

-- CreateIndex
CREATE INDEX "Quest_erstellerId_idx" ON "Quest"("erstellerId");
