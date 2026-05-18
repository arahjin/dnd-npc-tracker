import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/errorLog";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Max image generations per user per 24 hours */
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
    // Moderation guard: cheap pre-check so we don't pay for image gen when the
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
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "Kein Bild vom Modell erhalten." }, { status: 500 });

    const imageBuffer = Buffer.from(b64, "base64");
    const filename = `${kind}-${Date.now()}.png`;
    const { url } = await put(filename, imageBuffer, { access: "public", contentType: "image/png" });

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
