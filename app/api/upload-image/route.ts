import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { logError } from "@/lib/errorLog";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN fehlt." }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ungültige Formulardaten." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei gefunden." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Ungültiges Dateiformat. Erlaubt: JPG, PNG, WebP, GIF." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Datei zu groß (max. 5 MB)." }, { status: 400 });
  }

  try {
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `upload-${Date.now()}.${ext}`;
    const { url } = await put(filename, file, { access: "public" });
    return NextResponse.json({ url });
  } catch (err) {
    await logError("upload-image failed", err, session.user.id);
    return NextResponse.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
  }
}
