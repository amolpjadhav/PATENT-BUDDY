import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, getStatusLabel } from "@/lib/utils";
import { ProjectActions } from "@/components/ProjectActions";

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
      interview: { select: { currentStep: true, completed: true, updatedAt: true } },
      sections: { select: { id: true, type: true, title: true, order: true }, orderBy: { order: "asc" } },
      claims: { select: { id: true, number: true, claimType: true }, orderBy: { number: "asc" } },
      qualityCheck: { select: { results: true, runAt: true } },
    },
  });

  if (!project) return null;
  if (!tokens.includes(project.token)) return null;
  return project;
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const hasDraft = project.sections.length > 0;
  const interviewComplete = project.interview?.completed ?? false;

  let qualityIssues: Array<{ severity: string }> = [];
  if (project.qualityCheck) {
    try {
      qualityIssues = JSON.parse(project.qualityCheck.results);
    } catch {
      qualityIssues = [];
    }
  }
  const errorCount = qualityIssues.filter((i) => i.severity === "error").length;
  const warningCount = qualityIssues.filter((i) => i.severity === "warning").length;

  const INTERVIEW_TOTAL_STEPS = 5;
  const currentStep = project.interview?.currentStep ?? 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Projects
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-900 font-medium truncate max-w-[200px]">{project.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {project.inventorName && <span>Inventor: {project.inventorName}</span>}
            <span>Updated {formatDate(project.updatedAt)}</span>
            <Badge
              variant={project.status === "generated" ? "success" : project.status === "complete" ? "info" : "warning"}
            >
              {getStatusLabel(project.status)}
            </Badge>
          </div>
        </div>
        <ProjectActions projectId={id} />
      </div>

      {/* Progress steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Step 1: Interview */}
        <Card
          className={`${interviewComplete ? "border-green-300 bg-green-50" : "border-blue-300 bg-blue-50"}`}
        >
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  interviewComplete ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                }`}
              >
                {interviewComplete ? "✓" : "1"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Interview</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {interviewComplete
                    ? "Completed"
                    : `Step ${Math.min(currentStep + 1, INTERVIEW_TOTAL_STEPS)} of ${INTERVIEW_TOTAL_STEPS}`}
                </p>
                {!interviewComplete && (
                  <Link
                    href={`/projects/${id}/interview`}
                    className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {currentStep > 0 ? "Continue →" : "Start →"}
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Draft */}
        <Card className={hasDraft ? "border-green-300 bg-green-50" : "border-gray-200"}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  hasDraft ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {hasDraft ? "✓" : "2"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Draft Document</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {hasDraft
                    ? `${project.sections.length} sections, ${project.claims.length} claims`
                    : interviewComplete
                    ? "Ready to generate"
                    : "Complete interview first"}
                </p>
                {interviewComplete && (
                  <Link
                    href={`/projects/${id}/draft`}
                    className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {hasDraft ? "View & Edit →" : "Generate Draft →"}
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Export */}
        <Card className={hasDraft ? "border-gray-200" : "border-gray-100 opacity-60"}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  hasDraft ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Export</h3>
                <p className="text-xs text-gray-600 mt-0.5">Download as DOCX</p>
                {hasDraft && (
                  <Link
                    href={`/projects/${id}/export`}
                    className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Export →
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality check summary */}
      {qualityIssues.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Quality Check Results</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {errorCount > 0 && `${errorCount} error${errorCount > 1 ? "s" : ""}`}
                  {errorCount > 0 && warningCount > 0 && ", "}
                  {warningCount > 0 && `${warningCount} warning${warningCount > 1 ? "s" : ""}`}
                  {qualityIssues.length - errorCount - warningCount > 0 &&
                    ` + ${qualityIssues.length - errorCount - warningCount} suggestion${qualityIssues.length - errorCount - warningCount > 1 ? "s" : ""}`}
                </p>
              </div>
              <Link
                href={`/projects/${id}/draft`}
                className="text-xs font-medium text-orange-700 hover:text-orange-800"
              >
                View issues →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections overview */}
      {hasDraft && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Draft Sections</h2>
            <Link href={`/projects/${id}/draft`}>
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {project.sections.map((section) => (
              <Card key={section.id} className="hover:border-blue-200 transition-colors">
                <CardContent className="py-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                    {section.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-gray-900 truncate">{section.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {project.claims.length > 0 && (
            <div className="mt-3">
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Claims</p>
                      <p className="text-sm text-gray-900">
                        {project.claims.filter((c) => c.claimType === "independent").length} independent,{" "}
                        {project.claims.filter((c) => c.claimType === "dependent").length} dependent
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gray-200">{project.claims.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
