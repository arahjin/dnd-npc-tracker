import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/errorLog";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Max DALL-E 3 generations per user per 24 hours */
const DAILY_LIMIT = 5;
/** Max characters for the user prompt before our wrapper is added. */
const MAX_PROMPT_LENGTH = 500;

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
  const { prompt: rawPrompt, kind: rawKind } = await req.json();
  const prompt = typeof rawPrompt === "string" ? rawPrompt.trim() : "";
  const kind: "character" | "location" | "organisation" =
    rawKind === "location" || rawKind === "organisation" ? rawKind : "character";
  if (!prompt) {
    return NextResponse.json({ error: "Beschreibung fehlt." }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Beschreibung ist zu lang (max. ${MAX_PROMPT_LENGTH} Zeichen).` },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY fehlt in den Umgebungsvariablen." }, { status: 500 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN fehlt in den Umgebungsvariablen." }, { status: 500 });
  }

  try {
    // Moderation guard: cheap pre-check so we don't pay for DALL-E when the
    // prompt would be rejected by OpenAI policy anyway.
    const moderation = await openai.moderations.create({ input: prompt });
    if (moderation.results[0]?.flagged) {
      return NextResponse.json(
        { error: "Die Beschreibung verstößt gegen die Richtlinien und kann nicht verwendet werden." },
        { status: 400 },
      );
    }

    const templates = {
      character:    `Fantasy RPG character portrait, Dungeons and Dragons style, detailed illustration: ${prompt}. Dark fantasy art, dramatic lighting, painterly style.`,
      location:     `Fantasy RPG location landscape, Dungeons and Dragons style, detailed illustration: ${prompt}. Atmospheric environment, dramatic lighting, painterly style.`,
      organisation: `Fantasy RPG heraldic crest or banner, Dungeons and Dragons style, ornate emblem on dark background: ${prompt}. Detailed symbolic design, painterly style.`,
    } as const;
    const enhancedPrompt = templates[kind];

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

    const filename = `${kind}-${Date.now()}.png`;
    const { url } = await put(filename, imageBlob, { access: "public" });

    // ── Record usage ──────────────────────────────────────────────────────
    await prisma.bildGenerierung.create({ data: { userId } });

    return NextResponse.json({ url, remaining: DAILY_LIMIT - usedToday - 1 });

  } catch (err: unknown) {
    await logError("generate-image failed", err, userId);
    return NextResponse.json(
      { error: "Bildgenerierung fehlgeschlagen. Admins wurden informiert." },
      { status: 500 },
    );
  }
}
