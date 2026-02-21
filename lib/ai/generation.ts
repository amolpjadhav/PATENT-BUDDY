/**
 * High-level AI generation functions for patent drafting.
 *
 * DISCLAIMER: All AI-generated output is a preliminary draft for informational
 * and educational purposes only. It does NOT constitute legal advice and must
 * be reviewed by a registered patent attorney before filing.
 */

import path from "path";
import fs from "fs";
import { getAIProvider } from "./index";
import { buildDraftSectionsPrompt } from "@/lib/prompts/draft_sections_prompt";
import { buildClaimsPrompt } from "@/lib/prompts/claims_prompt";
import { prisma } from "@/lib/prisma";
import { logUsage } from "@/lib/token-usage";
import type { InterviewAnswers } from "@/types";

// ─── System prompt (lazy-loaded + cached) ────────────────────────────────────

let _systemPrompt: string | null = null;

function getSystemPrompt(): string {
  if (_systemPrompt) return _systemPrompt;
  const filePath = path.join(process.cwd(), "lib", "prompts", "system_patent_writer.txt");
  _systemPrompt = fs.readFileSync(filePath, "utf-8").trim();
  return _systemPrompt;
}

// ─── Valid section keys for draft sections (CLAIMS handled separately) ────────

const DRAFT_SECTION_KEYS = ["TITLE", "BACKGROUND", "SUMMARY", "DRAWINGS", "DETAILED_DESC", "ABSTRACT"] as const;
type DraftSectionKey = (typeof DRAFT_SECTION_KEYS)[number];

// ─── buildInventionContext ────────────────────────────────────────────────────

/**
 * Converts InterviewAnswers into a compact, structured JSON string that is
 * injected into each AI prompt as the invention disclosure context.
 */
export function buildInventionContext(answers: InterviewAnswers): string {
  const ctx = {
    // Step 1 — The Invention
    invention_title: answers.invention_title?.trim() || "Untitled Invention",
    one_sentence_summary: answers.one_sentence_summary?.trim() || "",
    problem_statement: answers.problem_statement?.trim() || "",
    // Step 2 — Prior Art & Novelty
    existing_solutions: answers.existing_solutions?.trim() || "",
    what_is_new: answers.what_is_new?.trim() || "",
    // Step 3 — How It Works
    core_components: answers.core_components?.trim() || "",
    system_overview: answers.system_overview?.trim() || "",
    main_flow_steps: answers.main_flow_steps?.trim() || "",
    alternative_variations: answers.alternative_variations?.trim() || "",
    // Step 4 — Technical Details
    key_parameters: answers.key_parameters?.trim() || "",
    data_inputs_outputs: answers.data_inputs_outputs?.trim() || "",
    edge_cases_failures: answers.edge_cases_failures?.trim() || "",
    // Step 5 — Value & Context
    advantages: answers.advantages?.trim() || "",
    example_use_case: answers.example_use_case?.trim() || "",
    user_roles: answers.user_roles?.trim() || "",
    deployment_environment: answers.deployment_environment?.trim() || "",
    // Step 6 — Compliance & Reference
    security_privacy: answers.security_privacy?.trim() || "",
    performance_constraints: answers.performance_constraints?.trim() || "",
    drawings_list: answers.drawings_list?.trim() || "",
    definitions_glossary: answers.definitions_glossary?.trim() || "",
  };
  return JSON.stringify(ctx, null, 2);
}

// ─── generateDraftSections ────────────────────────────────────────────────────

/**
 * Calls the AI to generate the 6 patent specification sections.
 * Logs token usage when userId is provided.
 */
export async function generateDraftSections(
  context: string,
  userId?: string,
  projectId?: string
): Promise<Record<DraftSectionKey, string>> {
  const ai = getAIProvider();
  const result = await ai.generateText({
    system: getSystemPrompt(),
    prompt: buildDraftSectionsPrompt(context),
    temperature: 0.4,
  });

  if (userId) {
    await logUsage({ userId, projectId, operation: "DRAFT_SECTIONS", usage: result.usage });
  }

  // Strip any accidental markdown fences
  const cleaned = result.content.replace(/^```json\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let parsed: { sections: Record<string, string> };
  try {
    parsed = JSON.parse(cleaned) as { sections: Record<string, string> };
  } catch {
    throw new Error(
      `AI returned invalid JSON for draft sections. Raw output (first 300 chars): ${result.content.slice(0, 300)}`
    );
  }

  // Only keep valid known keys; fill missing ones with an empty string
  const sectionsResult = {} as Record<DraftSectionKey, string>;
  for (const key of DRAFT_SECTION_KEYS) {
    sectionsResult[key] = (parsed.sections?.[key] ?? "").trim();
  }
  return sectionsResult;
}

// ─── generateClaims ──────────────────────────────────────────────────────────

/**
 * Calls the AI to generate the numbered patent claims as plain text.
 * Logs token usage when userId is provided.
 */
export async function generateClaims(
  context: string,
  userId?: string,
  projectId?: string
): Promise<string> {
  const ai = getAIProvider();
  const result = await ai.generateText({
    system: getSystemPrompt(),
    prompt: buildClaimsPrompt(context),
    temperature: 0.3,
  });

  if (userId) {
    await logUsage({ userId, projectId, operation: "CLAIMS", usage: result.usage });
  }

  return result.content.trim();
}

// ─── Dynamic Q&A context builder ─────────────────────────────────────────────

/**
 * Builds an invention context string from AI-generated questions + inventor answers.
 * Used when a project was created via the intake pipeline (has InterviewQuestion rows).
 */
export function buildInventionContextFromQA(
  qaPairs: Array<{ category: string; question: string; answer: string }>
): string {
  const grouped = new Map<string, Array<{ question: string; answer: string }>>();
  for (const { category, question, answer } of qaPairs) {
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category)!.push({ question, answer });
  }

  const sections: string[] = [];
  for (const [category, pairs] of grouped) {
    const lines = pairs
      .map(({ question, answer }) => `Q: ${question}\nA: ${answer || "(not answered)"}`)
      .join("\n\n");
    sections.push(`[${category}]\n${lines}`);
  }

  return sections.join("\n\n---\n\n");
}

// ─── generateAllDraftFromDynamic ──────────────────────────────────────────────

/**
 * Generates a full patent draft for projects created via the intake pipeline
 * (those with InterviewQuestion + InterviewAnswer rows keyed by question ID).
 */
export async function generateAllDraftFromDynamic(projectId: string, userId?: string) {
  // 1. Load generated questions (ordered)
  const questions = await prisma.interviewQuestion.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });
  if (questions.length === 0) {
    throw new Error("No interview questions found. Please generate questions first.");
  }

  // 2. Load all answers for the project
  const answerRows = await prisma.interviewAnswer.findMany({ where: { projectId } });
  const answerMap = Object.fromEntries(answerRows.map((r) => [r.questionKey, r.answer]));

  // 3. Build Q&A context
  const qaPairs = questions.map((q) => ({
    category: q.category,
    question: q.prompt,
    answer: answerMap[q.id] ?? "",
  }));
  const context = buildInventionContextFromQA(qaPairs);

  // 4. Generate sections then claims sequentially
  const sectionsMap = await generateDraftSections(context, userId, projectId);
  const claimsText = await generateClaims(context, userId, projectId);

  // 5. Upsert all sections + CLAIMS
  const sectionEntries = Object.entries(sectionsMap) as [string, string][];
  await Promise.all([
    ...sectionEntries.map(([sectionKey, content]) =>
      prisma.draftSection.upsert({
        where: { projectId_sectionKey: { projectId, sectionKey } },
        create: { projectId, sectionKey, content, updatedAt: new Date() },
        update: { content, updatedAt: new Date() },
      })
    ),
    prisma.draftSection.upsert({
      where: { projectId_sectionKey: { projectId, sectionKey: "CLAIMS" } },
      create: { projectId, sectionKey: "CLAIMS", content: claimsText, updatedAt: new Date() },
      update: { content: claimsText, updatedAt: new Date() },
    }),
  ]);

  // 6. Mark interview as completed
  await prisma.project.update({
    where: { id: projectId },
    data: { interviewCompleted: true },
  });

  const allSections = [
    ...sectionEntries.map(([sectionKey, content]) => ({ sectionKey, content })),
    { sectionKey: "CLAIMS", content: claimsText },
  ];

  return { success: true, sections: allSections };
}
