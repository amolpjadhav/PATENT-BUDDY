import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ProjectActions } from "@/components/ProjectActions";
import { SECTION_LABELS, type SectionKey } from "@/types";

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
      qualityIssues: true,
      _count: { select: { answers: true } },
    },
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const hasDraft = project.sections.length > 0;
  const highIssues = project.qualityIssues.filter((i) => i.severity === "HIGH").length;
  const medIssues  = project.qualityIssues.filter((i) => i.severity === "MED").length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">Projects</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-900 font-medium truncate max-w-[200px]">{project.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
            <Badge variant="default">{project.jurisdiction}</Badge>
            {hasDraft
              ? <Badge variant="success">Draft Ready</Badge>
              : project.interviewCompleted
              ? <Badge variant="info">Interview Done</Badge>
              : <Badge variant="warning">In Progress</Badge>
            }
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
        </div>
        <ProjectActions projectId={id} />
      </div>

      {/* 3-step progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Step 1 */}
        <Card className={project.interviewCompleted ? "border-green-300 bg-green-50" : "border-blue-300 bg-blue-50"}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${project.interviewCompleted ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
                {project.interviewCompleted ? "✓" : "1"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Interview</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {project.interviewCompleted
                    ? `Completed · ${project._count.answers} answers`
                    : `Step ${Math.min(project.interviewStep + 1, 5)} of 5`}
                </p>
                {!project.interviewCompleted && (
                  <Link href={`/projects/${id}/interview`} className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
                    {project.interviewStep > 0 ? "Continue →" : "Start →"}
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className={hasDraft ? "border-green-300 bg-green-50" : "border-gray-200"}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${hasDraft ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {hasDraft ? "✓" : "2"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Draft</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {hasDraft ? `${project.sections.length} sections` : project.interviewCompleted ? "Ready to generate" : "Complete interview first"}
                </p>
                {project.interviewCompleted && (
                  <Link href={`/projects/${id}/draft`} className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
                    {hasDraft ? "View & Edit →" : "Generate Draft →"}
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card className={hasDraft ? "border-gray-200" : "opacity-60"}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${hasDraft ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-400"}`}>
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Export</h3>
                <p className="text-xs text-gray-600 mt-0.5">Download as DOCX</p>
                {hasDraft && (
                  <Link href={`/projects/${id}/export`} className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
                    Export →
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality summary */}
      {project.qualityIssues.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Quality Issues</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {highIssues > 0 && <span className="text-red-600 font-medium">{highIssues} HIGH</span>}
                  {highIssues > 0 && medIssues > 0 && " · "}
                  {medIssues > 0 && <span className="text-orange-600 font-medium">{medIssues} MED</span>}
                  {project.qualityIssues.length - highIssues - medIssues > 0 && ` · ${project.qualityIssues.length - highIssues - medIssues} LOW`}
                </p>
              </div>
              <Link href={`/projects/${id}/draft`} className="text-xs font-medium text-orange-700 hover:text-orange-800">
                View issues →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section overview */}
      {hasDraft && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Draft Sections</h2>
            <Link href={`/projects/${id}/draft`}>
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {project.sections.map((s) => (
              <Card key={s.id} className="hover:border-blue-200 transition-colors">
                <CardContent className="py-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                    {s.sectionKey}
                  </p>
                  <p className="text-sm text-gray-900 truncate">
                    {SECTION_LABELS[s.sectionKey as SectionKey] ?? s.sectionKey}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
