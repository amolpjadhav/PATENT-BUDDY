import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";
import { checkRateLimit } from "@/lib/token-usage";
import { generateAllDraft } from "@/lib/actions";
import { generateAllDraftFromDynamic } from "@/lib/ai/generation";

export const maxDuration = 120;

/**
 * POST /api/generate/[id]
 *
 * Triggers AI generation of the complete patent draft (6 sections + claims).
 * Routes to the dynamic pipeline if the project has AI-generated interview questions,
 * otherwise falls back to the static interview pipeline.
 *
 * DISCLAIMER: AI output is a preliminary draft for informational purposes only.
 * It does NOT constitute legal advice.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const owned = await prisma.project.findUnique({ where: { id }, select: { userId: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (owned.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limit = await checkRateLimit(userId);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Daily limit reached", resetAt: limit.resetAt, remaining: 0 }, { status: 429 });
  }

  try {
    // Detect which pipeline to use
    const questionCount = await prisma.interviewQuestion.count({ where: { projectId: id } });
    const result = questionCount > 0
      ? await generateAllDraftFromDynamic(id, userId)
      : await generateAllDraft(id);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Draft generation failed";
    console.error("[generate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
