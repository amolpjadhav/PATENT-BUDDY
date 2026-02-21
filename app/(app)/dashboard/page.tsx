import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";
import { FREE_TIER_TOKENS_PER_DAY } from "@/lib/token-usage";
import { formatDate } from "@/lib/utils";

// Blended Gemini 2.0 Flash rate (~$0.15 / 1M tokens)
const COST_PER_TOKEN = 0.15 / 1_000_000;

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatCost(tokens: number): string {
  const cost = tokens * COST_PER_TOKEN;
  if (cost < 0.01) return "< $0.01";
  return `~$${cost.toFixed(2)}`;
}

// ── Nav bar shared between auth states ────────────────────────────────────────

function NavBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Patent Buddy</span>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}

// ── Unauthenticated landing ────────────────────────────────────────────────────

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavBar>
        <SignInButton size="sm" />
      </NavBar>

      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            AI-powered patent drafting
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Draft Patent Applications<br className="hidden sm:block" />
            <span className="text-blue-600"> with AI</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            Answer a few questions about your invention. We'll generate a structured USPTO-style patent draft in minutes.
          </p>
          <SignInButton size="lg" />
          <p className="text-xs text-gray-400 mt-4">Free during beta · No credit card required</p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              ),
              color: "bg-blue-50 text-blue-600",
              title: "Inventor Interview",
              desc: "AI-guided questions that surface the details that matter for a strong patent application.",
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              ),
              color: "bg-violet-50 text-violet-600",
              title: "Full Draft Generation",
              desc: "Background, Summary, Claims, Detailed Description, Abstract — all structured sections in one shot.",
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              ),
              color: "bg-emerald-50 text-emerald-600",
              title: "Quality Check",
              desc: "Automated review flags antecedent basis issues, vague terms, and missing required sections.",
            },
          ].map(({ icon, color, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to start?</h2>
          <p className="text-blue-200 text-sm mb-6">Sign in with Google — takes 10 seconds.</p>
          <SignInButton
            className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow"
          />
        </div>

        <p className="text-xs text-center text-gray-400 mt-10">
          AI output is a preliminary draft for informational purposes only. Not legal advice.
          Review with a registered patent attorney before filing.
        </p>
      </div>
    </div>
  );
}

// ── Authenticated dashboard ────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <LandingPage />;
  }

  const userId = session.user.id;
  const since = new Date(Date.now() - 86_400_000);

  const [projects, todayAgg, allTimeAgg] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { sections: true, qualityIssues: true } },
      },
    }),
    prisma.tokenUsage.aggregate({
      where: { userId, createdAt: { gte: since } },
      _sum: { totalTokens: true },
    }),
    prisma.tokenUsage.aggregate({
      where: { userId },
      _sum: { totalTokens: true },
    }),
  ]);

  const todayTokens = todayAgg._sum.totalTokens ?? 0;
  const allTimeTokens = allTimeAgg._sum.totalTokens ?? 0;
  const usagePct = Math.min(100, Math.round((todayTokens / FREE_TIER_TOKENS_PER_DAY) * 100));

  const draftReadyCount = projects.filter((p) => p._count.sections > 0).length;
  const inProgressCount = projects.filter((p) => !p.interviewCompleted && p._count.sections === 0).length;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <NavBar>
        {session.user.image && (
          <img src={session.user.image} alt="" className="w-7 h-7 rounded-full ring-1 ring-gray-200" />
        )}
        <span className="text-sm text-gray-600 hidden sm:block leading-none">{session.user.name}</span>
        <SignOutButton />
      </NavBar>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Greeting + new project */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hello, {firstName}!</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {projects.length === 0
                ? "Ready to draft your first patent?"
                : `${projects.length} project${projects.length !== 1 ? "s" : ""} · all your drafts in one place`}
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {/* Today's usage */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Today's Usage</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                usagePct >= 90 ? "bg-red-100 text-red-600" :
                usagePct >= 60 ? "bg-orange-100 text-orange-600" :
                "bg-green-100 text-green-600"
              }`}>{usagePct}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatTokens(todayTokens)}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">of {formatTokens(FREE_TIER_TOKENS_PER_DAY)} daily limit</p>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePct >= 90 ? "bg-red-500" :
                  usagePct >= 60 ? "bg-orange-400" :
                  "bg-blue-500"
                }`}
                style={{ width: `${Math.max(usagePct, usagePct > 0 ? 2 : 0)}%` }}
              />
            </div>
            {usagePct >= 90 && (
              <p className="text-[11px] text-red-500 mt-2 font-medium">Approaching daily limit</p>
            )}
          </div>

          {/* All-time usage + estimated cost */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">All-Time Usage</span>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatTokens(allTimeTokens)}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">tokens consumed total</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-emerald-600">{formatCost(allTimeTokens)}</span>
              <span className="text-xs text-gray-400">est. compute cost</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Based on Gemini 2.0 Flash pricing</p>
          </div>

          {/* Projects breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{projects.length}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">total</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span>{draftReadyCount} draft{draftReadyCount !== 1 ? "s" : ""} ready</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span>{inProgressCount} in progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Project list ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Projects</h2>

          {projects.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-14 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No patent projects yet</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Describe your invention and we'll guide you through the drafting process with AI assistance.
              </p>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Start Your First Patent Draft
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => {
                const hasDraft = p._count.sections > 0;
                const interviewDone = p.interviewCompleted;
                const isInProgress = !interviewDone && !hasDraft;
                const totalSteps = 6;

                return (
                  <div key={p.id} className="relative group">
                    {/* Invisible full-card link */}
                    <Link
                      href={`/projects/${p.id}`}
                      className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                      aria-label={p.title}
                    />

                    <div className={`bg-white border rounded-xl p-4 transition-all group-hover:shadow-md group-hover:border-blue-200 ${
                      hasDraft
                        ? "border-l-4 border-l-green-400 border-gray-200"
                        : interviewDone
                        ? "border-l-4 border-l-blue-400 border-gray-200"
                        : "border-gray-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          hasDraft ? "bg-green-400" : interviewDone ? "bg-blue-400" : "bg-amber-400"
                        }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                            <Badge variant={hasDraft ? "success" : interviewDone ? "info" : "warning"}>
                              {hasDraft ? "Draft Ready" : interviewDone ? "Interview Done" : "In Progress"}
                            </Badge>
                            {p.jurisdiction !== "US" && (
                              <Badge variant="default">{p.jurisdiction}</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            <span>Updated {formatDate(p.updatedAt)}</span>
                            {p._count.sections > 0 && (
                              <span>{p._count.sections} sections</span>
                            )}
                            {isInProgress && p.interviewStep > 0 && (
                              <span>Step {p.interviewStep + 1} of {totalSteps}</span>
                            )}
                            {p._count.qualityIssues > 0 && (
                              <span className="text-orange-500 font-medium">
                                {p._count.qualityIssues} quality issue{p._count.qualityIssues !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>

                          {isInProgress && (
                            <div className="flex gap-0.5 mt-2">
                              {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full ${
                                    i < p.interviewStep
                                      ? "bg-green-400"
                                      : i === p.interviewStep
                                      ? "bg-blue-400"
                                      : "bg-gray-100"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0 flex items-center gap-1.5">
                          {isInProgress && (
                            <Link
                              href={`/projects/${p.id}/interview`}
                              className="relative z-10 text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                            >
                              {p.interviewStep > 0 ? "Resume" : "Start"} →
                            </Link>
                          )}
                          {interviewDone && !hasDraft && (
                            <Link
                              href={`/projects/${p.id}/draft`}
                              className="relative z-10 text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                            >
                              Generate Draft →
                            </Link>
                          )}
                          {hasDraft && (
                            <Link
                              href={`/projects/${p.id}/draft`}
                              className="relative z-10 text-xs font-semibold text-emerald-600 hover:text-emerald-800 whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                            >
                              View Draft →
                            </Link>
                          )}
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Billing note */}
        <p className="mt-10 text-[11px] text-center text-gray-400 leading-relaxed">
          Estimated compute cost is for transparency only. Patent Buddy is free during beta.<br />
          Token costs based on Gemini 2.0 Flash blended pricing (~$0.15/1M tokens).<br />
          AI output is a preliminary draft only — not legal advice.
        </p>
      </div>
    </div>
  );
}
