import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ExportPage } from "@/components/ExportPage";

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
      sections: { select: { id: true }, orderBy: { order: "asc" } },
      claims: { select: { id: true }, orderBy: { number: "asc" } },
      qualityCheck: { select: { results: true } },
    },
  });

  if (!project || !tokens.includes(project.token)) return null;
  return project;
}

export default async function ExportPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const qualityIssues = project.qualityCheck ? JSON.parse(project.qualityCheck.results) : [];
  const errorCount = qualityIssues.filter((i: { severity: string }) => i.severity === "error").length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <ExportPage
        projectId={id}
        projectTitle={project.title}
        hasDraft={project.sections.length > 0}
        claimsCount={project.claims.length}
        sectionsCount={project.sections.length}
        qualityErrorCount={errorCount}
      />
    </main>
  );
}
