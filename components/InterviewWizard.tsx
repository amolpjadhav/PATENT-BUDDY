"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import {
  INTERVIEW_STEPS,
  InterviewStep,
  Question,
  computeCompleteness,
  isStepComplete,
  stepAnsweredCount,
} from "@/lib/interview/questions";
import { InterviewAnswers } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface InterviewWizardProps {
  projectId: string;
  projectTitle: string;
  initialAnswers: InterviewAnswers;
  initialStep: number;
  completed: boolean;
}

// ─── Completeness ring (SVG) ──────────────────────────────────────────────────

function CompletenessRing({ pct }: { pct: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const done = pct === 100;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="flex-shrink-0">
      <circle cx="34" cy="34" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="34"
        cy="34"
        r={r}
        fill="none"
        stroke={done ? "#16a34a" : "#3b82f6"}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      <text
        x="34"
        y="38"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={done ? "#15803d" : "#1d4ed8"}
        fontFamily="sans-serif"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── Sidebar step item ────────────────────────────────────────────────────────

function StepNavItem({
  step,
  answers,
  isActive,
  onClick,
}: {
  step: InterviewStep;
  answers: Record<string, string>;
  isActive: boolean;
  onClick: () => void;
}) {
  const complete = isStepComplete(step, answers);
  const answered = stepAnsweredCount(step, answers);
  const total = step.questions.length;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
        isActive
          ? "bg-blue-50 border border-blue-200"
          : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      {/* Step indicator */}
      <div
        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
          complete
            ? "bg-green-100 text-green-700"
            : isActive
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {complete ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step.id + 1
        )}
      </div>

      {/* Title + progress */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-blue-900" : "text-gray-700"}`}>
          {step.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {answered}/{total} answered
        </p>
      </div>
    </button>
  );
}

// ─── Example box (collapsible) ────────────────────────────────────────────────

function ExampleBox({ example }: { example: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {open ? "Hide example" : "See an example"}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs text-gray-600 whitespace-pre-line leading-relaxed">
          {example}
        </div>
      )}
    </div>
  );
}

// ─── Single question renderer ─────────────────────────────────────────────────

function QuestionBlock({
  question,
  index,
  value,
  onChange,
  error,
}: {
  question: Question;
  index: number;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const id = `q-${question.key}`;

  const renderInput = () => {
    if (question.type === "textarea") {
      return (
        <Textarea
          id={id}
          rows={question.rows ?? 5}
          placeholder={question.example ? "Type your answer here…" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );
    }
    if (question.type === "select") {
      return (
        <div className="space-y-1.5">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
          >
            <option value="">Select an option…</option>
            {question.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      );
    }
    if (question.type === "multiselect") {
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <div className="space-y-2">
          {question.options?.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, o.value]
                    : selected.filter((v) => v !== o.value);
                  onChange(next.join(","));
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {o.label}
            </label>
          ))}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      );
    }
    // text
    return (
      <Input
        id={id}
        placeholder={question.example ? "Type your answer here…" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
    );
  };

  return (
    <div className="space-y-2">
      {/* Question number + title */}
      <div className="flex items-baseline gap-2">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <label htmlFor={id} className="text-sm font-semibold text-gray-800">
          {question.title}
          {question.validation?.required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      </div>

      {/* Prompt (question text) */}
      <p className="text-base text-gray-700 pl-8">{question.prompt}</p>

      {/* Help text */}
      <p className="text-xs text-gray-500 pl-8">{question.helpText}</p>

      {/* Input */}
      <div className="pl-8">{renderInput()}</div>

      {/* Example */}
      {question.example && (
        <div className="pl-8">
          <ExampleBox example={question.example} />
        </div>
      )}
    </div>
  );
}

// ─── Completion screen ────────────────────────────────────────────────────────

function CompletionScreen({
  projectId,
  projectTitle,
  completeness,
  onReview,
}: {
  projectId: string;
  projectTitle: string;
  completeness: { pct: number; answered: number; total: number };
  onReview: () => void;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/generate/${projectId}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }
      router.push(`/projects/${projectId}/draft`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center max-w-md mx-auto">
      {/* Check icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
      <p className="text-gray-500 mb-1 text-sm">
        {completeness.answered} of {completeness.total} required questions answered
      </p>
      <p className="text-gray-600 mb-7 text-sm max-w-sm">
        We&apos;ll use your answers to generate a complete provisional patent draft — all sections and a full claim set.
      </p>

      {error && (
        <div className="mb-5 w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
          {error.toLowerCase().includes("api key") && (
            <p className="mt-1 font-medium">Please set OPENAI_API_KEY in .env and restart the server.</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button onClick={handleGenerate} loading={generating} size="lg" className="flex-1 sm:flex-none">
          {generating ? "Generating draft…" : "Generate Patent Draft"}
          {!generating && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </Button>
        <Button variant="secondary" onClick={onReview} className="flex-1 sm:flex-none">
          Review Answers
        </Button>
      </div>

      {generating && (
        <p className="mt-5 text-xs text-gray-400">This usually takes 30–60 seconds. Please keep this tab open.</p>
      )}

      <div className="mt-8">
        <Link href={`/projects/${projectId}`} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {projectTitle}
        </Link>
      </div>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function InterviewWizard({
  projectId,
  projectTitle,
  initialAnswers,
  initialStep,
  completed: initialCompleted,
}: InterviewWizardProps) {
  const router = useRouter();

  // Cast to a plain Record for the helpers in questions.ts
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialAnswers as Record<string, string>
  );
  const [currentStepIdx, setCurrentStepIdx] = useState(
    initialCompleted ? INTERVIEW_STEPS.length : Math.min(initialStep, INTERVIEW_STEPS.length - 1)
  );
  const [isComplete, setIsComplete] = useState(initialCompleted);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState(false);

  // Save status indicator
  type SaveStatus = "idle" | "pending" | "saving" | "saved";
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  const stepIdxRef = useRef(currentStepIdx);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { stepIdxRef.current = currentStepIdx; }, [currentStepIdx]);

  const completeness = computeCompleteness(answers);
  const canGenerate = completeness.pct === 100;

  const step = INTERVIEW_STEPS[currentStepIdx];
  const isLastStep = currentStepIdx === INTERVIEW_STEPS.length - 1;

  // ── Autosave logic ─────────────────────────────────────────────────────────

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus("pending");
    debounceRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await fetch(`/api/interview/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answersRef.current,
            currentStep: stepIdxRef.current,
            completed: false,
          }),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    }, 1000);
  }, [projectId]);

  // Flush debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Answer update ──────────────────────────────────────────────────────────

  const updateAnswer = useCallback(
    (key: string, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        answersRef.current = next;
        return next;
      });
      // Clear field error on change
      setFieldErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  // ── Visible questions (dependency filtering) ───────────────────────────────

  const visibleQuestions = step.questions.filter((q) => {
    if (!q.dependsOn) return true;
    const depVal = answers[q.dependsOn.key] ?? "";
    return q.dependsOn.values.includes(depVal);
  });

  // ── Validate current step ──────────────────────────────────────────────────

  function validateStep(): boolean {
    const errors: Record<string, string> = {};
    for (const q of visibleQuestions) {
      if (!q.validation?.required) continue;
      const val = answers[q.key] ?? "";
      if (!val.trim()) {
        errors[q.key] = "This field is required.";
      } else if (q.validation.minLength && val.trim().length < q.validation.minLength) {
        errors[q.key] = `Please write at least ${q.validation.minLength} characters.`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Navigate steps ─────────────────────────────────────────────────────────

  async function handleNext() {
    if (!validateStep()) {
      // Scroll to first error
      const firstError = Object.keys(fieldErrors)[0] || visibleQuestions.find(
        (q) => q.validation?.required && !(answers[q.key] ?? "").trim()
      )?.key;
      if (firstError) {
        document.getElementById(`q-${firstError}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSavingStep(true);
    try {
      const nextIdx = currentStepIdx + 1;
      const complete = nextIdx >= INTERVIEW_STEPS.length;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      await fetch(`/api/interview/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersRef.current,
          currentStep: nextIdx,
          completed: complete,
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);

      if (complete) {
        setIsComplete(true);
      } else {
        setCurrentStepIdx(nextIdx);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setSavingStep(false);
    }
  }

  async function handleBack() {
    if (currentStepIdx === 0) return;
    setSaving(true);
    try {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      await fetch(`/api/interview/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersRef.current,
          currentStep: currentStepIdx - 1,
          completed: false,
        }),
      });
      setCurrentStepIdx((s) => s - 1);
      setFieldErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setSaving(true);
    try {
      const res = await fetch(`/api/generate/${projectId}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }
      router.push(`/projects/${projectId}/draft`);
    } catch {
      setSaving(false);
    }
  }

  // ── Completion screen ──────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <CompletionScreen
        projectId={projectId}
        projectTitle={projectTitle}
        completeness={completeness}
        onReview={() => {
          setIsComplete(false);
          setCurrentStepIdx(INTERVIEW_STEPS.length - 1);
        }}
      />
    );
  }

  // ── Main two-column layout ─────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar (desktop) ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-gray-200 bg-white px-4 py-6">
        {/* Back link */}
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {projectTitle}
        </Link>

        {/* Completeness ring */}
        <div className="flex flex-col items-center gap-2 mb-5 pb-5 border-b border-gray-100">
          <CompletenessRing pct={completeness.pct} />
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700">Completeness</p>
            <p className="text-xs text-gray-400">
              {completeness.answered}/{completeness.total} required answered
            </p>
          </div>
        </div>

        {/* Step list */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {INTERVIEW_STEPS.map((s) => (
            <StepNavItem
              key={s.id}
              step={s}
              answers={answers}
              isActive={s.id === currentStepIdx}
              onClick={() => {
                setCurrentStepIdx(s.id);
                setFieldErrors({});
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </nav>

        {/* Generate Draft button */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          {canGenerate ? (
            <Button onClick={handleGenerate} loading={saving} className="w-full" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Draft
            </Button>
          ) : (
            <div className="space-y-1.5">
              <Button disabled className="w-full" size="sm" variant="secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Generate Draft
              </Button>
              <p className="text-xs text-center text-gray-400">
                Answer all required fields to unlock
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main panel ────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 lg:py-8 max-w-2xl">
        {/* Mobile: back + progress */}
        <div className="lg:hidden mb-5">
          <Link
            href={`/projects/${projectId}`}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-3"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {projectTitle}
          </Link>

          {/* Mobile progress bar */}
          <div className="flex items-center gap-2 mb-1">
            {INTERVIEW_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < currentStepIdx ? "bg-green-500" : i === currentStepIdx ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Step {currentStepIdx + 1} of {INTERVIEW_STEPS.length}
            </span>
            <span>{completeness.pct}% complete</span>
          </div>
        </div>

        {/* Step header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
              Step {step.id + 1} of {INTERVIEW_STEPS.length}
            </span>
            {/* Autosave indicator */}
            <span
              className={`ml-auto text-xs transition-opacity ${
                saveStatus === "idle" ? "opacity-0" : "opacity-100"
              } ${
                saveStatus === "saved" ? "text-green-600" : "text-gray-400"
              }`}
            >
              {saveStatus === "pending" && "•••"}
              {saveStatus === "saving" && "Saving…"}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{step.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{step.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {visibleQuestions.map((q, i) => (
            <QuestionBlock
              key={q.key}
              question={q}
              index={i}
              value={answers[q.key] ?? ""}
              onChange={(val) => updateAnswer(q.key, val)}
              error={fieldErrors[q.key]}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStepIdx === 0 || saving || savingStep}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>

          <Button onClick={handleNext} loading={savingStep} disabled={saving}>
            {isLastStep ? "Finish Interview" : "Next"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Mobile: Generate Draft at bottom */}
        {canGenerate && (
          <div className="lg:hidden mt-5">
            <Button onClick={handleGenerate} loading={saving} className="w-full">
              Generate Patent Draft
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
