"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { addProjectToSession, removeProjectFromSession } from "@/lib/session";
import type { InterviewAnswers, QualityIssueInput } from "@/types";
import {
  buildInventionContext,
  generateDraftSections,
  generateClaims,
} from "@/lib/ai/generation";

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function createProject(title: string, jurisdiction = "US") {
  const project = await prisma.project.create({
    data: { title: title.trim(), jurisdiction },
  });
  await addProjectToSession(project.id);
  revalidatePath("/");
  return project;
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      answers: true,
      sections: true,
      qualityIssues: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  await removeProjectFromSession(id);
  revalidatePath("/");
}

// ─── Interview answers ────────────────────────────────────────────────────────

export async function saveAnswer(
  projectId: string,
  questionKey: string,
  answer: string
) {
  return prisma.interviewAnswer.upsert({
    where: { projectId_questionKey: { projectId, questionKey } },
    create: { projectId, questionKey, answer, updatedAt: new Date() },
    update: { answer, updatedAt: new Date() },
  });
}

export async function listAnswers(projectId: string) {
  return prisma.interviewAnswer.findMany({
    where: { projectId },
    orderBy: { questionKey: "asc" },
  });
}

// ─── Draft sections ───────────────────────────────────────────────────────────

export async function saveDraftSection(
  projectId: string,
  sectionKey: string,
  content: string
) {
  return prisma.draftSection.upsert({
    where: { projectId_sectionKey: { projectId, sectionKey } },
    create: { projectId, sectionKey, content, updatedAt: new Date() },
    update: { content, updatedAt: new Date() },
  });
}

export async function listDraftSections(projectId: string) {
  return prisma.draftSection.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Quality issues ───────────────────────────────────────────────────────────

export async function saveQualityIssues(
  projectId: string,
  issues: QualityIssueInput[]
) {
  await prisma.qualityIssue.deleteMany({ where: { projectId } });
  if (issues.length > 0) {
    await prisma.qualityIssue.createMany({
      data: issues.map((i) => ({
        projectId,
        type: i.type,
        severity: i.severity,
        message: i.message,
        metadata: JSON.stringify(i.metadata ?? {}),
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/draft`);
}

export async function listQualityIssues(projectId: string) {
  return prisma.qualityIssue.findMany({
    where: { projectId },
    orderBy: [{ severity: "desc" }, { createdAt: "asc" }],
  });
}

// ─── AI generation ────────────────────────────────────────────────────────────

/**
 * Generates a complete patent draft for a project:
 *   1. Loads all InterviewAnswer rows for the project
 *   2. Builds a structured invention context string
 *   3. Calls the AI to generate the 6 specification sections (parallel with claims)
 *   4. Calls the AI to generate the numbered claims (parallel with sections)
 *   5. Upserts all 7 DraftSection records (6 sections + CLAIMS)
 *   6. Marks the project interview as completed
 *
 * DISCLAIMER: AI output is a preliminary draft for informational purposes only.
 * It does NOT constitute legal advice.
 *
 * @returns { success: true, sections: [{ sectionKey, content }] }
 */
export async function generateAllDraft(projectId: string) {
  // 1. Load interview answers
  const answerRows = await prisma.interviewAnswer.findMany({ where: { projectId } });
  if (answerRows.length === 0) {
    throw new Error("No interview answers found. Please complete the interview first.");
  }
  const answers = Object.fromEntries(
    answerRows.map((r) => [r.questionKey, r.answer])
  ) as InterviewAnswers;

  // 2. Build structured context
  const context = buildInventionContext(answers);

  // 3. Generate sections then claims sequentially to avoid rate limits
  const sectionsMap = await generateDraftSections(context);
  const claimsText = await generateClaims(context);

  // 4. Upsert the 6 specification sections + CLAIMS section
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

  // 5. Mark project interview as completed
  await prisma.project.update({
    where: { id: projectId },
    data: { interviewCompleted: true },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/draft`);

  const allSections = [
    ...sectionEntries.map(([sectionKey, content]) => ({ sectionKey, content })),
    { sectionKey: "CLAIMS", content: claimsText },
  ];

  return { success: true, sections: allSections };
}
