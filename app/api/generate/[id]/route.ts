import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDraftPrompt, buildClaimsPrompt, DRAFT_SYSTEM_PROMPT } from "@/lib/prompts/draft";
import { InterviewAnswers } from "@/types";

function getTokenList(req: NextRequest): string[] {
  const raw = req.cookies.get("patent_buddy_session")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// POST /api/generate/[id] - generate draft from interview answers
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokens = getTokenList(req);

  const project = await prisma.project.findUnique({
    where: { id },
    include: { interview: true },
  });

  if (!project || !tokens.includes(project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!project.interview) {
    return NextResponse.json({ error: "Interview not completed" }, { status: 400 });
  }

  const answers: InterviewAnswers = JSON.parse(project.interview.answers || "{}");
  const ai = getAIProvider();

  // Step 1: Generate sections
  let sectionsData: { sections: Array<{ type: string; title: string; content: string; order: number }> };
  try {
    const sectionsRaw = await ai.complete(
      [
        { role: "system", content: DRAFT_SYSTEM_PROMPT },
        { role: "user", content: buildDraftPrompt(answers) },
      ],
      { temperature: 0.4, maxTokens: 4096 }
    );

    const cleaned = sectionsRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    sectionsData = JSON.parse(cleaned);
  } catch (err) {
    console.error("Sections generation failed:", err);
    return NextResponse.json({ error: "Failed to generate sections" }, { status: 500 });
  }

  // Step 2: Generate claims
  const detailedSection = sectionsData.sections.find((s) => s.type === "detailed_description");
  let claimsData: { claims: Array<{ number: number; claimType: string; content: string; dependsOn: number | null }> };
  try {
    const claimsRaw = await ai.complete(
      [
        { role: "system", content: DRAFT_SYSTEM_PROMPT },
        { role: "user", content: buildClaimsPrompt(answers, detailedSection?.content ?? "") },
      ],
      { temperature: 0.3, maxTokens: 2048 }
    );

    const cleaned = claimsRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    claimsData = JSON.parse(cleaned);
  } catch (err) {
    console.error("Claims generation failed:", err);
    return NextResponse.json({ error: "Failed to generate claims" }, { status: 500 });
  }

  // Save sections (upsert)
  await prisma.$transaction([
    prisma.section.deleteMany({ where: { projectId: id } }),
    ...sectionsData.sections.map((s) =>
      prisma.section.create({
        data: {
          projectId: id,
          type: s.type,
          title: s.title,
          content: s.content,
          order: s.order,
          updatedAt: new Date(),
        },
      })
    ),
  ]);

  // Save claims (upsert)
  await prisma.$transaction([
    prisma.claim.deleteMany({ where: { projectId: id } }),
    ...claimsData.claims.map((c) =>
      prisma.claim.create({
        data: {
          projectId: id,
          number: c.number,
          claimType: c.claimType,
          content: c.content,
          dependsOn: c.dependsOn ?? null,
          updatedAt: new Date(),
        },
      })
    ),
  ]);

  // Update project status
  await prisma.project.update({
    where: { id },
    data: { status: "generated" },
  });

  return NextResponse.json({ success: true, sectionsCount: sectionsData.sections.length, claimsCount: claimsData.claims.length });
}
