import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExportPage } from "@/components/ExportPage";

export default async function ExportPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      sections: { select: { id: true } },
      qualityIssues: { select: { severity: true } },
    },
  });
  if (!project || project.userId !== session.user.id) notFound();

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
