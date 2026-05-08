import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({ url });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
