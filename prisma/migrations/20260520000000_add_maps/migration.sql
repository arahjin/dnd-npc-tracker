-- Phase 1: Karten-Feature
-- Per-kampagne map images with normalized (0..1) location pin placements.

-- CreateTable
CREATE TABLE "Map" (
    "id" TEXT NOT NULL,
    "kampagneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "beschreibung" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "erstellerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapPlacement" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MapPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Map_kampagneId_idx" ON "Map"("kampagneId");

-- CreateIndex
CREATE INDEX "Map_erstellerId_idx" ON "Map"("erstellerId");

-- CreateIndex
CREATE INDEX "MapPlacement_mapId_idx" ON "MapPlacement"("mapId");

-- CreateIndex
CREATE INDEX "MapPlacement_locationId_idx" ON "MapPlacement"("locationId");

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_kampagneId_fkey" FOREIGN KEY ("kampagneId") REFERENCES "Kampagne"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_erstellerId_fkey" FOREIGN KEY ("erstellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlacement" ADD CONSTRAINT "MapPlacement_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlacement" ADD CONSTRAINT "MapPlacement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
