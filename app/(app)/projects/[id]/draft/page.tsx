import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DraftEditor } from "@/components/DraftEditor";

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { createdAt: "asc" } },
      qualityIssues: { orderBy: [{ severity: "desc" }, { createdAt: "asc" }] },
    },
  });
  if (!project || project.userId !== session.user.id) notFound();

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
