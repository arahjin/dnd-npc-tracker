import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Max DALL-E 3 generations per user per 24 hours */
const DAILY_LIMIT = 5;

export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }
  const userId = session.user.id;

  // ── Rate limit (per user, rolling 24 h) ──────────────────────────────────
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const usedToday = await prisma.bildGenerierung.count({
    where: { userId, createdAt: { gte: since } },
  });
  if (usedToday >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Tageslimit erreicht: maximal ${DAILY_LIMIT} Bildgenerierungen pro 24 Stunden.` },
      { status: 429 }
    );
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const { prompt } = await req.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Beschreibung fehlt." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY fehlt in den Umgebungsvariablen." }, { status: 500 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN fehlt in den Umgebungsvariablen." }, { status: 500 });
  }

  try {
    const enhancedPrompt = `Fantasy RPG character portrait, Dungeons and Dragons style, detailed illustration: ${prompt}. Dark fantasy art, dramatic lighting, painterly style.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const tempUrl = response.data?.[0]?.url;
    if (!tempUrl) return NextResponse.json({ error: "Kein Bild von DALL-E erhalten." }, { status: 500 });

    const imageRes = await fetch(tempUrl);
    if (!imageRes.ok) return NextResponse.json({ error: "Bild konnte nicht von DALL-E heruntergeladen werden." }, { status: 500 });
    const imageBlob = await imageRes.blob();

    const filename = `npc-${Date.now()}.png`;
    const { url } = await put(filename, imageBlob, { access: "public" });

    // ── Record usage ──────────────────────────────────────────────────────
    await prisma.bildGenerierung.create({ data: { userId } });

    return NextResponse.json({ url, remaining: DAILY_LIMIT - usedToday - 1 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
