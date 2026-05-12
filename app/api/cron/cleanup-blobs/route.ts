import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/errorLog";

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Collect all blob URLs from Vercel Blob (paginated)
    const blobUrls: { url: string; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ cursor, limit: 1000 });
      for (const blob of page.blobs) {
        blobUrls.push({ url: blob.url, uploadedAt: new Date(blob.uploadedAt) });
      }
      cursor = page.cursor;
    } while (cursor);

    // Collect all referenced image URLs from the DB in one query each
    const [npcs, charaktere, orgs, locations] = await Promise.all([
      prisma.nPC.findMany({ where: { image: { not: null } }, select: { image: true } }),
      prisma.charakter.findMany({ where: { image: { not: null } }, select: { image: true } }),
      prisma.organisation.findMany({ where: { image: { not: null } }, select: { image: true } }),
      prisma.location.findMany({ where: { image: { not: null } }, select: { image: true } }),
    ]);

    const usedUrls = new Set<string>([
      ...npcs.map((r) => r.image!),
      ...charaktere.map((r) => r.image!),
      ...orgs.map((r) => r.image!),
      ...locations.map((r) => r.image!),
    ]);

    const cutoff = new Date(Date.now() - ONE_HOUR_MS);
    const toDelete = blobUrls.filter(
      (b) => !usedUrls.has(b.url) && b.uploadedAt < cutoff,
    );

    if (toDelete.length > 0) {
      await del(toDelete.map((b) => b.url));
    }

    return NextResponse.json({
      scanned: blobUrls.length,
      used: usedUrls.size,
      deleted: toDelete.length,
    });
  } catch (err) {
    await logError("cron/cleanup-blobs failed", err);
    return NextResponse.json({ error: "Cleanup fehlgeschlagen." }, { status: 500 });
  }
}
