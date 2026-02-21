import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { FAQSection } from "@/components/landing/FAQSection";

// ─── Product Preview Mockup ───────────────────────────────────────────────────

function ProductPreview() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)] border border-gray-200 bg-white">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center mx-4">
            app.patentbuddy.com/projects/cuid123/interview
          </div>
        </div>
        {/* App header */}
        <div className="flex items-center justify-between bg-white border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">Self-Watering Plant System</span>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Confidential
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Autosaved
            </span>
          </div>
        </div>
        {/* Tab bar */}
        <div className="flex items-center border-b border-gray-100 bg-gray-50 px-4">
          {["Interview", "Draft", "Quality Checks"].map((tab, i) => (
            <div
              key={tab}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                i === 0
                  ? "border-blue-600 text-blue-600 bg-white -mb-px"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab}
            </div>
          ))}
          <div className="ml-auto px-4 py-2">
            <div className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export DOCX
            </div>
          </div>
        </div>
        {/* Main content */}
        <div className="flex bg-white" style={{ height: "320px" }}>
          {/* Sidebar */}
          <aside className="w-52 flex-shrink-0 border-r border-gray-100 flex flex-col py-4 px-3 gap-1 overflow-hidden">
            {[
              { label: "Background", done: true },
              { label: "The Problem", done: true },
              { label: "How It Works", active: true, done: false },
              { label: "Technical Details", done: false },
              { label: "Claims Support", done: false },
            ].map(({ label, done, active }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
                  active ? "bg-blue-50 border border-blue-200 text-blue-800 font-medium"
                  : done ? "text-green-700"
                  : "text-gray-400"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  active ? "bg-blue-600 text-white" : done ? "bg-green-100 text-green-600" : "bg-gray-100"
                }`}>
                  {done ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {label}
              </div>
            ))}
            <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
              <div className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] text-gray-500 text-center">
                Save Progress
              </div>
              <div className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Generate Draft
              </div>
            </div>
          </aside>
          {/* Question area */}
          <div className="flex-1 px-6 py-5 overflow-hidden">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-1">Step 3 of 5</div>
            <h3 className="text-base font-bold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Describe the core components of your invention.{" "}
                  <span className="text-red-500">*</span>
                </p>
                <p className="text-[10px] text-gray-400 mb-2">
                  List the main parts, modules, or elements that make up your system or device.
                </p>
                <div className="rounded-lg border border-blue-200 bg-blue-50/40 px-3 py-2.5 text-[11px] text-gray-600 leading-relaxed h-20 overflow-hidden">
                  The system comprises three core components: (1) a capacitive soil moisture sensor array embedded in the growing medium, (2) a microcontroller unit that processes sensor readings against crop-specific thresholds, and (3) a variable-rate drip irrigation valve controlled by PWM signals…
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Saved just now
              </div>
              <div className="flex gap-2">
                <div className="text-[10px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600">← Back</div>
                <div className="text-[10px] bg-blue-600 text-white rounded-lg px-3 py-1.5">Next →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    title: "Guided Invention Interview",
    desc: "Smart AI-tailored questions capture your invention's novelty, components, and variations — no legal jargon required.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    title: "Claims Coach",
    desc: "Generate independent and dependent claims with proper structure. Broad first claim, narrowing fallbacks.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    title: "Multiple Embodiments",
    desc: "Automatically draft alternative implementations and variations to broaden your protection.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    title: "Quality & Consistency Checks",
    desc: "Flag antecedent basis issues, vague language, and missing support before your attorney sees the draft.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    title: "DOCX Export",
    desc: "Download a clean, formatted Word document. Share with your attorney exactly the way they expect.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    title: "Privacy-First Controls",
    desc: "No training on your content. Delete your project anytime. Confidential by default.",
    color: "bg-rose-50 text-rose-600",
  },
];

const HOW_IT_WORKS = [
  {
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    title: "Answer guided questions",
    desc: "Describe your invention in plain English. Our AI generates a personalised set of 12–20 questions tailored to your specific invention.",
  },
  {
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    title: "Review and refine your draft",
    desc: "Patent Buddy generates every section — abstract, background, summary, detailed description, drawings, and claims. Edit inline to perfection.",
  },
  {
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    title: "Export and collaborate with an attorney",
    desc: "Download a clean DOCX and hand it to your patent attorney for final review and filing. Save hours of billable time.",
  },
];

const TRUST_LOGOS = ["MakerHub", "InventorLab", "StartupForge", "OpenDevice", "BuildFirst", "TechGarage"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-white">
      <LandingNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/60 to-teal-100/80 -z-10" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl -z-10" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-emerald-200/30 blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-blue-200/20 blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI-powered patent drafting assistant
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Draft your patent application
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              from scratch — without the pain.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Patent Buddy guides inventors through a smart interview and generates a complete, structured draft
            with claims, embodiments, quality checks, and DOCX export.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5">
            <Link
              href="/projects/new"
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-base font-semibold text-white hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-teal-200 hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              Start Drafting — It&apos;s Free
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              See How It Works
            </Link>
          </div>

          <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Drafting assistance only. Not legal advice. Consult a patent attorney before filing.
          </p>
        </div>

        {/* Floating product preview overlapping hero */}
        <div className="relative -mb-16 sm:-mb-24">
          <ProductPreview />
        </div>
      </section>

      {/* ── Trust Strip ─────────────────────────────────────────────────────── */}
      <section className="pt-24 sm:pt-36 pb-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Built for solo inventors. Ready for startups and teams.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            {TRUST_LOGOS.map((name) => (
              <div
                key={name}
                className="rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-400 shadow-sm hover:text-gray-600 transition-colors"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-3">Our Mission</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-snug">
                Every inventor deserves a clear path to protection.
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                We believe every inventor should be able to protect their ideas without being overwhelmed
                by complex paperwork. Patent Buddy transforms patent drafting into a guided, structured
                workflow — so you can focus on building, not formatting.
              </p>
            </div>
            <div className="space-y-5">
              {[
                {
                  icon: "✦",
                  title: "Remove blank-page anxiety",
                  desc: "Start by simply describing your invention. The interview-first approach means you never stare at an empty document.",
                  color: "bg-emerald-50 text-emerald-700",
                },
                {
                  icon: "⬡",
                  title: "Improve draft quality and structure",
                  desc: "Automated checks flag antecedent basis issues, missing support, and vague terms before your attorney sees the draft.",
                  color: "bg-blue-50 text-blue-700",
                },
                {
                  icon: "◈",
                  title: "Accelerate your path to protection",
                  desc: "A structured first draft cuts attorney review time significantly. Faster filing means earlier priority dates.",
                  color: "bg-violet-50 text-violet-700",
                },
              ].map((p) => (
                <div key={p.title} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center text-lg flex-shrink-0`}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              From first idea to attorney-ready draft
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Patent Buddy handles structure, language, and consistency — so you can focus on your invention.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-3">Simple process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Three steps to a complete draft</h2>
            <p className="text-gray-500 max-w-lg mx-auto">No prior patent experience needed. Patent Buddy walks you through every step.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map(({ icon, title, desc }, i) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5 shadow-sm">
                  {icon}
                </div>
                <div className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2">Step {i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-base font-semibold text-white hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-teal-200"
            >
              Start Drafting Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Security ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-3">Security & Privacy</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">Your invention stays yours.</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Your invention represents years of work and insight. We treat that accordingly — with strong privacy
                defaults and full user control over your data.
              </p>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Start a Confidential Draft
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🔒", title: "Encrypted storage", desc: "All project data is encrypted at rest and in transit." },
                { icon: "🚫", title: "No AI training", desc: "Your invention content is never used to train any AI model." },
                { icon: "🗑️", title: "Delete anytime", desc: "Permanently remove your project and all associated data in one click." },
                { icon: "🤝", title: "Controlled sharing", desc: "Your project link stays private until you choose to share it." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-2xl mb-2">{icon}</div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-3">Simple pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Start free. Scale when you need to.</h2>
            <p className="text-gray-500">No credit card required to get started.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Solo */}
            <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm flex flex-col">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Solo</h3>
                <p className="text-gray-500 text-sm">For individual inventors getting started.</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">Free</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-700">
                {["Guided interview", "AI draft generation", "Full claims set", "Quality checks", "DOCX export"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/projects/new" className="block w-full text-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                Get Started
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 shadow-lg flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Coming soon</span>
              </div>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
                <p className="text-white/70 text-sm">For teams and frequent filers.</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-white/60 text-sm ml-1">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-white">
                {["Everything in Solo", "Advanced quality checks", "Multiple embodiments", "Collaboration tools", "Priority support"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full text-center rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white opacity-60 cursor-not-allowed">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to protect your invention?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join inventors who have used Patent Buddy to turn their ideas into structured, attorney-ready drafts.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 hover:bg-gray-50 transition-colors shadow-lg"
          >
            Start Drafting — It&apos;s Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-xs text-white/50">No account required. No credit card. Start in seconds.</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-white font-bold">Patent Buddy</span>
              </div>
              <p className="text-sm leading-relaxed">Making patent drafting accessible to every inventor.</p>
            </div>
            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3 text-sm">
              {[
                { label: "Product", href: "#features" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Contact", href: "mailto:hello@patentbuddy.com" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© {new Date().getFullYear()} Patent Buddy. All rights reserved.</p>
            <p className="text-slate-500 text-center sm:text-right max-w-sm">
              NOT LEGAL ADVICE — Patent Buddy produces drafts for informational purposes only.
              Always consult a registered patent attorney before filing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
