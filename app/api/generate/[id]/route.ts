import { NextRequest, NextResponse } from "next/server";
import { getSessionIdsFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateAllDraft } from "@/lib/actions";
import { generateAllDraftFromDynamic } from "@/lib/ai/generation";

export const maxDuration = 120;

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

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
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!sessionIds(req).includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Detect which pipeline to use
    const questionCount = await prisma.interviewQuestion.count({ where: { projectId: id } });
    const result = questionCount > 0
      ? await generateAllDraftFromDynamic(id)
      : await generateAllDraft(id);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Draft generation failed";
    console.error("[generate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
