import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Beschreibung fehlt." }, { status: 400 });
  }

  const enhancedPrompt = `Fantasy RPG character portrait, Dungeons and Dragons style, detailed illustration: ${prompt}. Dark fantasy art, dramatic lighting, painterly style.`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const tempUrl = response.data?.[0]?.url;
  if (!tempUrl) return NextResponse.json({ error: "Kein Bild erhalten." }, { status: 500 });

  // Bild herunterladen
  const imageRes = await fetch(tempUrl);
  if (!imageRes.ok) return NextResponse.json({ error: "Bild konnte nicht geladen werden." }, { status: 500 });
  const imageBlob = await imageRes.blob();

  // Zu Vercel Blob hochladen
  const filename = `npc-${Date.now()}.png`;
  const { url } = await put(filename, imageBlob, { access: "public" });

  return NextResponse.json({ url });
}
