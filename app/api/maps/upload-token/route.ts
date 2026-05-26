import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireKampagneApi } from "@/lib/kampagne";

/**
 * Issues a client-upload token so the browser can POST directly to Vercel Blob.
 * Bypasses Vercel's 4.5 MB serverless body limit, which matters for large map images.
 * DM-only; allowed content types restricted to common bitmap formats.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });
  if (!ctx.isDM && !ctx.isAdmin) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN fehlt." }, { status: 500 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        addRandomSuffix: true,
        maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB — client compresses oversized images before upload
        tokenPayload: JSON.stringify({ userId: session.user!.id, kampagneId: ctx.kampagneId }),
      }),
      onUploadCompleted: async () => {
        // No-op: the client posts the blob URL to /api/maps afterwards.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload fehlgeschlagen." },
      { status: 400 }
    );
  }
}
