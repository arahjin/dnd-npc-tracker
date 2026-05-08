/*
  Warnings:

  - You are about to drop the column `organisationen` on the `NPC` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NPC" DROP COLUMN "organisationen";

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "beschreibung" TEXT,
    "typ" TEXT,
    "region" TEXT,
    "alignment" TEXT,
    "beziehungZurGruppe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPCOrganisation" (
    "id" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "rolle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NPCOrganisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NPCOrganisation_npcId_organisationId_key" ON "NPCOrganisation"("npcId", "organisationId");

-- AddForeignKey
ALTER TABLE "NPCOrganisation" ADD CONSTRAINT "NPCOrganisation_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCOrganisation" ADD CONSTRAINT "NPCOrganisation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
