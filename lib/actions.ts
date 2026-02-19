"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { addProjectToSession, removeProjectFromSession } from "@/lib/session";
import type { QualityIssueInput } from "@/types";

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
