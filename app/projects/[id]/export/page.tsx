import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ExportPage } from "@/components/ExportPage";

async function getProject(id: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("patent_buddy_session")?.value;
  let ids: string[] = [];
  try { ids = JSON.parse(raw ?? "[]"); } catch { ids = []; }
  if (!ids.includes(id)) return null;

  return prisma.project.findUnique({
    where: { id },
    include: {
      sections: { select: { id: true } },
      qualityIssues: { select: { severity: true } },
    },
  });
}

export default async function ExportPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const highCount = project.qualityIssues.filter((i) => i.severity === "HIGH").length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <ExportPage
        projectId={id}
        projectTitle={project.title}
        hasDraft={project.sections.length > 0}
        sectionsCount={project.sections.length}
        qualityErrorCount={highCount}
      />
    </main>
  );
}
