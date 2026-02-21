import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InterviewWizard } from "@/components/InterviewWizard";
import { DynamicInterviewWizard } from "@/components/DynamicInterviewWizard";
import { InterviewLoadingScreen } from "@/components/InterviewLoadingScreen";
import type { InterviewAnswers, InterviewQuestionRow } from "@/types";

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      answers: true,
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!project || project.userId !== session.user.id) notFound();

  const questions = project.questions;

  // ── Dynamic path: AI-generated questions exist ─────────────────────────────
  if (questions.length > 0) {
    const initialAnswers: Record<string, string> = Object.fromEntries(
      project.answers.map((a) => [a.questionKey, a.answer])
    );

    return (
      <DynamicInterviewWizard
        projectId={id}
        projectTitle={project.title}
        questions={questions as InterviewQuestionRow[]}
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
