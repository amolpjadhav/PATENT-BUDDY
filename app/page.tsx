import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

async function getProjects() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("patent_buddy_session")?.value;
  if (!raw) return [];
  let ids: string[] = [];
  try { ids = JSON.parse(raw) as string[]; } catch { return []; }
  if (ids.length === 0) return [];

  return prisma.project.findMany({
    where: { id: { in: ids } },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { answers: true, sections: true, qualityIssues: true } },
    },
  });
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          For solo inventors
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Draft Your Patent with <span className="text-blue-600">PatentBuddy</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Answer guided questions about your invention. We&apos;ll generate a structured US provisional-style patent
          application — sections, claims, and abstract — ready for your attorney to review.
        </p>
        <Link href="/projects/new">
          <Button size="lg">
            Start a New Invention
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </Link>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: "🎯", title: "Guided Interview", desc: "5-step wizard tailored to your invention" },
          { icon: "⚡", title: "AI Draft", desc: "Generates all 7 sections + claims in minutes" },
          { icon: "✅", title: "Quality Checks", desc: "Flags antecedent basis, missing support, vague terms" },
          { icon: "✏️", title: "Inline Editing", desc: "Refine every section and claim in the browser" },
          { icon: "📄", title: "DOCX Export", desc: "Formatted Word document for your attorney" },
          { icon: "🔒", title: "Confidential", desc: "Private to your browser session" },
        ].map((f) => (
          <Card key={f.title}>
            <CardContent className="py-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects list */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
            <Link href="/projects/new">
              <Button variant="secondary" size="sm">+ New Project</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {projects.map((p) => {
              const hasDraft = p._count.sections > 0;
              const interviewDone = p.interviewCompleted;
              const inProgress = !interviewDone && !hasDraft;
              const totalSteps = 6;
              return (
                <div key={p.id} className="relative group">
                  {/* Stretched base link — covers whole card, goes to project detail */}
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
                            {p.jurisdiction !== "US" && (
                              <Badge variant="default">{p.jurisdiction}</Badge>
                            )}
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
                          {/* Step progress pips for in-progress interviews */}
                          {inProgress && (
                            <div className="flex gap-1 mt-2">
                              {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full ${
                                    i < p.interviewStep
                                      ? "bg-green-400"
                                      : i === p.interviewStep
                                      ? "bg-blue-400"
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {/* Quick action link — sits above the stretched base link via relative z-10 */}
                          <div className="mt-2.5">
                            {inProgress && (
                              <Link
                                href={`/projects/${p.id}/interview`}
                                className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {p.interviewStep > 0 ? "Resume Interview" : "Start Interview"}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            )}
                            {interviewDone && !hasDraft && (
                              <Link
                                href={`/projects/${p.id}/draft`}
                                className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Generate Draft
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            )}
                            {hasDraft && (
                              <Link
                                href={`/projects/${p.id}/draft`}
                                className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
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
        </div>
      )}
    </main>
  );
}
