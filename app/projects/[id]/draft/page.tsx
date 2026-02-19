import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DraftEditor } from "@/components/DraftEditor";

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
    include: {
      interview: { select: { completed: true } },
      sections: { orderBy: { order: "asc" } },
      claims: { orderBy: { number: "asc" } },
      qualityCheck: true,
    },
  });

  if (!project || !tokens.includes(project.token)) return null;
  return project;
}

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const initialQualityIssues = project.qualityCheck
    ? JSON.parse(project.qualityCheck.results)
    : [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <DraftEditor
        projectId={id}
        projectTitle={project.title}
        interviewComplete={project.interview?.completed ?? false}
        initialSections={project.sections}
        initialClaims={project.claims}
        initialQualityIssues={initialQualityIssues}
        qualityCheckRunAt={project.qualityCheck?.runAt ?? null}
      />
    </main>
  );
}
