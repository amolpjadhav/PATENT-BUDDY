import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { InterviewWizard } from "@/components/InterviewWizard";

async function getProject(id: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("patent_buddy_session")?.value;
  let tokens: string[] = [];
  if (raw) {
    try {
      tokens = JSON.parse(raw) as string[];
    } catch {
      tokens = [];
    }
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { interview: true },
  });

  if (!project || !tokens.includes(project.token)) return null;
  return project;
}

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const initialAnswers = project.interview?.answers
    ? JSON.parse(project.interview.answers)
    : {};
  const initialStep = project.interview?.currentStep ?? 0;
  const completed = project.interview?.completed ?? false;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <InterviewWizard
        projectId={id}
        projectTitle={project.title}
        initialAnswers={initialAnswers}
        initialStep={initialStep}
        completed={completed}
      />
    </main>
  );
}
