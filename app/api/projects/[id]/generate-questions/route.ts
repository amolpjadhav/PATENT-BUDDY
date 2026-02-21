import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";
import { checkRateLimit, logUsage } from "@/lib/token-usage";
import { getAIProvider } from "@/lib/ai";
import { buildExtractionPrompt } from "@/lib/prompts/extraction_prompt";
import { buildQuestionGenerationPrompt } from "@/lib/prompts/question_generation_prompt";
import type { ExtractedInventionJson, GeneratedQuestion } from "@/types";

export const maxDuration = 120;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!project.intakeNotes) {
    return NextResponse.json({ error: "No intake notes found for this project" }, { status: 400 });
  }

  const limit = await checkRateLimit(userId);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Daily limit reached", resetAt: limit.resetAt, remaining: 0 }, { status: 429 });
  }

  // Load any PDF and TRANSCRIPT artifacts
  const artifacts = await prisma.projectArtifact.findMany({
    where: { projectId: id, type: { in: ["PDF", "TRANSCRIPT"] } },
  });
  const pdfText = artifacts.find((a) => a.type === "PDF")?.content ?? undefined;
  const transcript = artifacts.find((a) => a.type === "TRANSCRIPT")?.content ?? undefined;

  const ai = getAIProvider();

  // Step 1: Extraction
  let extractedJson: ExtractedInventionJson;
  try {
    const result = await ai.generateText({
      system: "You are a patent intake specialist. Return only valid JSON.",
      prompt: buildExtractionPrompt(project.intakeNotes, pdfText, transcript),
      temperature: 0.2,
    });
    await logUsage({ userId, projectId: id, operation: "EXTRACTION", usage: result.usage });
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    extractedJson = JSON.parse(cleaned) as ExtractedInventionJson;
  } catch (err) {
    console.error("[generate-questions] Extraction failed:", err);
    return NextResponse.json({ error: "Extraction step failed. Please try again." }, { status: 500 });
  }

  // Persist extraction results
  await prisma.project.update({
    where: { id },
    data: {
      extractedJson: JSON.stringify(extractedJson),
      intakeSummary: extractedJson.solution,
    },
  });

  // Step 2: Question generation
  let questions: GeneratedQuestion[];
  try {
    const result = await ai.generateText({
      system: "You are a patent interview specialist. Return only valid JSON.",
      prompt: buildQuestionGenerationPrompt(JSON.stringify(extractedJson, null, 2), project.intakeNotes),
      temperature: 0.3,
    });
    await logUsage({ userId, projectId: id, operation: "QUESTIONS", usage: result.usage });
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    questions = JSON.parse(cleaned) as GeneratedQuestion[];
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Empty question array returned");
    }
  } catch (err) {
    console.error("[generate-questions] Question generation failed:", err);
    return NextResponse.json({ error: "Question generation failed. Please try again." }, { status: 500 });
  }

  // Persist questions (replace any existing ones)
  await prisma.interviewQuestion.deleteMany({ where: { projectId: id } });
  await prisma.interviewQuestion.createMany({
    data: questions.map((q) => ({
      projectId: id,
      order: q.order,
      category: q.category,
      prompt: q.prompt,
      helpText: q.helpText ?? null,
      answerType: q.answerType ?? "LONGTEXT",
      required: q.required ?? false,
    })),
  });

  const saved = await prisma.interviewQuestion.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ questions: saved });
}
