import { NextRequest, NextResponse } from "next/server";
import { getSessionIdsFromRequest } from "@/lib/session";
import { generateAllDraft } from "@/lib/actions";

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

/**
 * POST /api/generate/[id]
 *
 * Triggers AI generation of the complete patent draft (6 sections + claims).
 * Delegates all logic to the generateAllDraft server action.
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
    const result = await generateAllDraft(id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Draft generation failed";
    console.error("[generate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
