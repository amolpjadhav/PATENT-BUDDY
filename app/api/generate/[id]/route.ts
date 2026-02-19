import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDraftPrompt, DRAFT_SYSTEM_PROMPT } from "@/lib/prompts/draft";
import { getSessionIdsFromRequest } from "@/lib/session";
import { InterviewAnswers, SECTION_KEYS } from "@/types";

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

// POST /api/generate/[id] — generate draft from interview answers
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sessionIds(req).includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Load answers from InterviewAnswer rows → reconstruct InterviewAnswers object
  const answerRows = await prisma.interviewAnswer.findMany({ where: { projectId: id } });
  if (answerRows.length === 0) {
    return NextResponse.json({ error: "No interview answers found" }, { status: 400 });
  }

  const answers: InterviewAnswers = Object.fromEntries(
    answerRows.map((r) => [r.questionKey, r.answer])
  ) as InterviewAnswers;

  const ai = getAIProvider();
  let sections: Array<{ sectionKey: string; content: string }>;

  try {
    const raw = await ai.complete(
      [
        { role: "system", content: DRAFT_SYSTEM_PROMPT },
        { role: "user", content: buildDraftPrompt(answers) },
      ],
      { temperature: 0.4, maxTokens: 4096 }
    );
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as { sections: Array<{ sectionKey: string; content: string }> };
    sections = parsed.sections;
  } catch (err) {
    console.error("Draft generation failed:", err);
    return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 });
  }

  // Validate sectionKeys; filter unknown keys
  const validKeys = new Set<string>(SECTION_KEYS);
  const validSections = sections.filter((s) => validKeys.has(s.sectionKey));

  // Upsert each DraftSection
  await Promise.all(
    validSections.map((s) =>
      prisma.draftSection.upsert({
        where: { projectId_sectionKey: { projectId: id, sectionKey: s.sectionKey } },
        create: { projectId: id, sectionKey: s.sectionKey, content: s.content, updatedAt: new Date() },
        update: { content: s.content, updatedAt: new Date() },
      })
    )
  );

  // Mark interview completed
  await prisma.project.update({
    where: { id },
    data: { interviewCompleted: true },
  });

  return NextResponse.json({ success: true, sectionsCount: validSections.length });
}
