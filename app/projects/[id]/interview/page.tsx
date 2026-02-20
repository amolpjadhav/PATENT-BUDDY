import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { InterviewWizard } from "@/components/InterviewWizard";
import { DynamicInterviewWizard } from "@/components/DynamicInterviewWizard";
import { InterviewLoadingScreen } from "@/components/InterviewLoadingScreen";
import type { InterviewAnswers } from "@/types";

async function getProject(id: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("patent_buddy_session")?.value;
  let ids: string[] = [];
  try { ids = JSON.parse(raw ?? "[]"); } catch { ids = []; }
  if (!ids.includes(id)) return null;

  return prisma.project.findUnique({
    where: { id },
    include: {
      answers: true,
      questions: { orderBy: { order: "asc" } },
    },
  });
}

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const questions = project.questions;

  // ── Dynamic path: AI-generated questions exist ─────────────────────────────
  if (questions.length > 0) {
    // Build answer map keyed by question ID
    const initialAnswers: Record<string, string> = Object.fromEntries(
      project.answers.map((a) => [a.questionKey, a.answer])
    );

    return (
      <DynamicInterviewWizard
        projectId={id}
        projectTitle={project.title}
        questions={questions}
        initialAnswers={initialAnswers}
        initialStep={project.interviewStep}
        completed={project.interviewCompleted}
      />
    );
  }

  // ── Loading path: intake notes provided but questions not yet generated ─────
  if (project.intakeNotes) {
    return <InterviewLoadingScreen projectId={id} />;
  }

  // ── Legacy path: no intake, use static wizard ──────────────────────────────
  const initialAnswers: InterviewAnswers = Object.fromEntries(
    project.answers.map((a) => [a.questionKey, a.answer])
  ) as InterviewAnswers;

  return (
    <InterviewWizard
      projectId={id}
      projectTitle={project.title}
      initialAnswers={initialAnswers}
      initialStep={project.interviewStep}
      completed={project.interviewCompleted}
    />
  );
}
