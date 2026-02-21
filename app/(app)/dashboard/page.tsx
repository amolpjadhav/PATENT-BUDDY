import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { answers: true, sections: true, qualityIssues: true } },
    },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Patent drafts in progress and completed</p>
        </div>
        <Link href="/projects/new">
          <Button size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-500 text-sm mb-6">Start by describing your invention and we'll guide you through the rest.</p>
          <Link href="/projects/new">
            <Button>Start Your First Patent Draft</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const hasDraft = p._count.sections > 0;
            const interviewDone = p.interviewCompleted;
            const inProgress = !interviewDone && !hasDraft;
            const totalSteps = 6;
            return (
              <div key={p.id} className="relative group">
                <Link
                  href={`/projects/${p.id}`}
                  className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  aria-label={p.title}
                />
                <Card className="group-hover:border-blue-300 group-hover:shadow-md transition-all">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-gray-900 truncate">{p.title}</h3>
                          <Badge variant={hasDraft ? "success" : interviewDone ? "info" : "warning"}>
                            {hasDraft ? "Draft Ready" : interviewDone ? "Interview Done" : "In Progress"}
                          </Badge>
                          {p.jurisdiction !== "US" && <Badge variant="default">{p.jurisdiction}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <span>Updated {formatDate(p.updatedAt)}</span>
                          {inProgress && p.interviewStep > 0 && (
                            <span>Step {p.interviewStep + 1} of {totalSteps}</span>
                          )}
                          {p._count.sections > 0 && <span>{p._count.sections} sections</span>}
                          {p._count.qualityIssues > 0 && (
                            <span className="text-orange-600">{p._count.qualityIssues} quality issues</span>
                          )}
                        </div>
                        {inProgress && (
                          <div className="flex gap-1 mt-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                  i < p.interviewStep ? "bg-green-400" : i === p.interviewStep ? "bg-blue-400" : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-2.5">
                          {inProgress && (
                            <Link href={`/projects/${p.id}/interview`} className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                              {p.interviewStep > 0 ? "Resume Interview" : "Start Interview"}
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                          {interviewDone && !hasDraft && (
                            <Link href={`/projects/${p.id}/draft`} className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                              Generate Draft
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                          {hasDraft && (
                            <Link href={`/projects/${p.id}/draft`} className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                              View Draft
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
