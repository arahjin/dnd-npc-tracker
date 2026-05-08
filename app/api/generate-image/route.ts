import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

  const url = response.data[0]?.url;
  if (!url) return NextResponse.json({ error: "Kein Bild erhalten." }, { status: 500 });

  return NextResponse.json({ url });
}
