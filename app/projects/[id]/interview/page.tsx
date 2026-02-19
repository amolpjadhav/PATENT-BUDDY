import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { InterviewWizard } from "@/components/InterviewWizard";
import type { InterviewAnswers } from "@/types";

async function getProject(id: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("patent_buddy_session")?.value;
  let ids: string[] = [];
  try { ids = JSON.parse(raw ?? "[]"); } catch { ids = []; }
  if (!ids.includes(id)) return null;

  return prisma.project.findUnique({
    where: { id },
    include: { answers: true },
  });
}

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  // Reconstruct InterviewAnswers object from individual rows
  const initialAnswers: InterviewAnswers = Object.fromEntries(
    project.answers.map((a) => [a.questionKey, a.answer])
  ) as InterviewAnswers;

  // Wizard manages its own layout (sidebar + main)
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
