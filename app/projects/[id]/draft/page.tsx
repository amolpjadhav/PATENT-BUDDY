import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DraftEditor } from "@/components/DraftEditor";

async function getProject(id: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("patent_buddy_session")?.value;
  let ids: string[] = [];
  try { ids = JSON.parse(raw ?? "[]"); } catch { ids = []; }
  if (!ids.includes(id)) return null;

  return prisma.project.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { createdAt: "asc" } },
      qualityIssues: { orderBy: [{ severity: "desc" }, { createdAt: "asc" }] },
    },
  });
}

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <DraftEditor
        projectId={id}
        projectTitle={project.title}
        interviewComplete={project.interviewCompleted}
        initialSections={project.sections}
        initialQualityIssues={project.qualityIssues}
        qualityCheckedAt={project.qualityIssues[0]?.createdAt ?? null}
      />
    </main>
  );
}
