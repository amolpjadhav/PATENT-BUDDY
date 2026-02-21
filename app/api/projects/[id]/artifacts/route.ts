import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

// Vercel Blob is optional — only used when BLOB_READ_WRITE_TOKEN is set.
// Without it, files are not stored externally but extracted content is still
// persisted in the DB and used for question generation.
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function uploadToBlob(path: string, buffer: Buffer, contentType: string): Promise<string | null> {
  if (!BLOB_TOKEN) return null;
  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(path, buffer, { access: "public", contentType, token: BLOB_TOKEN });
    return blob.url;
  } catch (err) {
    console.warn("[artifacts] Vercel Blob upload failed:", err);
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const authResult = await requireAuthUser();
    if (authResult instanceof NextResponse) return authResult;
    const { id: userId } = authResult;

    const owned = await prisma.project.findUnique({ where: { id }, select: { userId: true } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (owned.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const type = formData.get("type") as string;
    const file = formData.get("file") as File | null;

    if (!file || !["PDF", "AUDIO", "VIDEO"].includes(type)) {
      return NextResponse.json({ error: "Missing file or invalid type" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── PDF ──────────────────────────────────────────────────────────────────
    if (type === "PDF") {
      // Try uploading to Vercel Blob (optional)
      const storageUrl = await uploadToBlob(
        `projects/${id}/artifacts/${Date.now()}-${file.name}`,
        buffer,
        "application/pdf"
      );

      // Extract text. pdf-parse is in serverExternalPackages so require() loads
      // it as CJS from node_modules at runtime (no webpack bundling issues).
      let extractedText = "";
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
        const data = await pdfParse(buffer);
        extractedText = data.text.trim();
      } catch (err) {
        console.warn("[artifacts] PDF text extraction failed:", err);
        // Non-fatal — the PDF is still stored, just without extracted text
      }

      const artifact = await prisma.projectArtifact.create({
        data: {
          projectId: id,
          type: "PDF",
          storageUrl,
          content: extractedText || null,
          metadata: JSON.stringify({ filename: file.name, sizeBytes: buffer.length }),
        },
      });

      return NextResponse.json({ artifact });
    }

    // ── AUDIO / VIDEO ─────────────────────────────────────────────────────────
    if (type === "AUDIO" || type === "VIDEO") {
      const mimeType = file.type || (type === "VIDEO" ? "video/mp4" : "audio/webm");

      const storageUrl = await uploadToBlob(
        `projects/${id}/artifacts/${Date.now()}-${file.name}`,
        buffer,
        mimeType
      );

      const mediaArtifact = await prisma.projectArtifact.create({
        data: {
          projectId: id,
          type,
          storageUrl,
          metadata: JSON.stringify({ filename: file.name, mimeType, sizeBytes: buffer.length }),
        },
      });

      // Attempt Gemini transcription
      let transcriptArtifact = null;
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey && geminiKey.startsWith("AIza")) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const mediaBase64 = buffer.toString("base64");
          const transcribePrompt =
            type === "VIDEO"
              ? "Please transcribe all speech from this video accurately, preserving all technical terms and domain-specific language."
              : "Please transcribe this audio recording accurately, preserving all technical terms and domain-specific language.";

          const result = await model.generateContent([
            { inlineData: { mimeType, data: mediaBase64 } },
            transcribePrompt,
          ]);
          const transcript = result.response.text().trim();
          if (transcript) {
            transcriptArtifact = await prisma.projectArtifact.create({
              data: { projectId: id, type: "TRANSCRIPT", content: transcript },
            });
          }
        } catch (err) {
          console.warn(`[artifacts] Gemini ${type.toLowerCase()} transcription failed:`, err);
          // Non-fatal — continue without transcript
        }
      }

      return NextResponse.json({ artifact: mediaArtifact, transcript: transcriptArtifact });
    }

    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });

  } catch (err) {
    console.error("[artifacts] Unhandled error:", err);
    const message = err instanceof Error ? err.message : "Artifact upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
