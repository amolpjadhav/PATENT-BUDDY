"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import type { InterviewQuestionRow } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DynamicInterviewWizardProps {
  projectId: string;
  projectTitle: string;
  questions: InterviewQuestionRow[];
  initialAnswers: Record<string, string>; // questionId → answer
  initialStep: number;
  completed: boolean;
}

// ─── Derived step shape ───────────────────────────────────────────────────────

interface DynamicStep {
  idx: number;
  category: string;
  questions: InterviewQuestionRow[];
}

function buildSteps(questions: InterviewQuestionRow[]): DynamicStep[] {
  const categoryOrder: string[] = [];
  const grouped = new Map<string, InterviewQuestionRow[]>();

  for (const q of questions) {
    if (!grouped.has(q.category)) {
      categoryOrder.push(q.category);
      grouped.set(q.category, []);
    }
    grouped.get(q.category)!.push(q);
  }

  return categoryOrder.map((cat, idx) => ({
    idx,
    category: cat,
    questions: grouped.get(cat)!,
  }));
}

// ─── Completeness helpers ─────────────────────────────────────────────────────

function computeDynamicCompleteness(
  questions: InterviewQuestionRow[],
  answers: Record<string, string>
) {
  const required = questions.filter((q) => q.required);
  const answered = required.filter((q) => (answers[q.id] ?? "").trim().length > 0);
  const pct = required.length === 0 ? 100 : Math.round((answered.length / required.length) * 100);
  return { pct, answered: answered.length, total: required.length };
}

function isStepAnswered(step: DynamicStep, answers: Record<string, string>) {
  const required = step.questions.filter((q) => q.required);
  return required.every((q) => (answers[q.id] ?? "").trim().length > 0);
}

function stepAnsweredCount(step: DynamicStep, answers: Record<string, string>) {
  return step.questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
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
  step: DynamicStep;
  answers: Record<string, string>;
  isActive: boolean;
  onClick: () => void;
}) {
  const complete = isStepAnswered(step, answers);
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
          step.idx + 1
        )}
      </div>

      {/* Title + progress */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-blue-900" : "text-gray-700"}`}>
          {step.category}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {answered}/{total} answered
        </p>
      </div>
    </button>
  );
}

// ─── Single question renderer ─────────────────────────────────────────────────

function DynamicQuestionBlock({
  question,
  index,
  value,
  onChange,
  error,
}: {
  question: InterviewQuestionRow;
  index: number;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const id = `q-${question.id}`;

  const renderInput = () => {
    if (question.answerType === "TEXT") {
      return (
        <Input
          id={id}
          placeholder="Type your answer here…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );
    }
    if (question.answerType === "BULLETS") {
      return (
        <Textarea
          id={id}
          rows={4}
          placeholder={"• Point 1\n• Point 2\n• Point 3"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );
    }
    // LONGTEXT (default)
    return (
      <Textarea
        id={id}
        rows={6}
        placeholder="Type your answer here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
    );
  };

  return (
    <div className="space-y-2">
      {/* Question number + prompt */}
      <div className="flex items-baseline gap-2">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <label htmlFor={id} className="text-sm font-semibold text-gray-800">
          {question.prompt}
          {question.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>

      {/* Help text */}
      {question.helpText && (
        <p className="text-xs text-gray-500 pl-8">{question.helpText}</p>
      )}

      {/* Input */}
      <div className="pl-8">{renderInput()}</div>
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

export function DynamicInterviewWizard({
  projectId,
  projectTitle,
  questions,
  initialAnswers,
  initialStep,
  completed: initialCompleted,
}: DynamicInterviewWizardProps) {
  const router = useRouter();
  const steps = buildSteps(questions);

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [currentStepIdx, setCurrentStepIdx] = useState(
    initialCompleted ? steps.length : Math.min(initialStep, Math.max(0, steps.length - 1))
  );
  const [isComplete, setIsComplete] = useState(initialCompleted);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState(false);

  // Save status indicator
  type SaveStatus = "idle" | "pending" | "saving" | "saved";
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [relativeTime, setRelativeTime] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  const stepIdxRef = useRef(currentStepIdx);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { stepIdxRef.current = currentStepIdx; }, [currentStepIdx]);

  // Keep "X min ago" label fresh
  useEffect(() => {
    function updateRelative() {
      if (!lastSavedAt) return;
      const diff = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      if (diff < 10) setRelativeTime("just now");
      else if (diff < 60) setRelativeTime(`${diff}s ago`);
      else setRelativeTime(`${Math.floor(diff / 60)}m ago`);
    }
    updateRelative();
    const id = setInterval(updateRelative, 15000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  const completeness = computeDynamicCompleteness(questions, answers);
  const canGenerate = completeness.pct === 100;

  const step = steps[currentStepIdx] ?? steps[0];
  const isLastStep = currentStepIdx === steps.length - 1;

  // ── Shared save helper ─────────────────────────────────────────────────────

  async function persistSave(completed = false) {
    await fetch(`/api/interview/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: answersRef.current,
        currentStep: stepIdxRef.current,
        completed,
      }),
    });
    setLastSavedAt(new Date());
  }

  // ── Autosave logic ─────────────────────────────────────────────────────────

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus("pending");
    debounceRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await persistSave();
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ── Manual save ────────────────────────────────────────────────────────────

  async function handleManualSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus("saving");
    try {
      await persistSave();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }

  // Flush debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Answer update ──────────────────────────────────────────────────────────

  const updateAnswer = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value };
        answersRef.current = next;
        return next;
      });
      setFieldErrors((prev) => {
        if (!prev[questionId]) return prev;
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  // ── Validate current step ──────────────────────────────────────────────────

  function validateStep(): boolean {
    if (!step) return true;
    const errors: Record<string, string> = {};
    for (const q of step.questions) {
      if (!q.required) continue;
      const val = answers[q.id] ?? "";
      if (!val.trim()) {
        errors[q.id] = "This field is required.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Navigate steps ─────────────────────────────────────────────────────────

  async function handleNext() {
    if (!validateStep()) {
      const firstErrorId = Object.keys(fieldErrors)[0] ||
        step?.questions.find((q) => q.required && !(answers[q.id] ?? "").trim())?.id;
      if (firstErrorId) {
        document.getElementById(`q-${firstErrorId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSavingStep(true);
    try {
      const nextIdx = currentStepIdx + 1;
      const complete = nextIdx >= steps.length;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      stepIdxRef.current = nextIdx;
      await persistSave(complete);
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
      stepIdxRef.current = currentStepIdx - 1;
      await persistSave();
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
          setCurrentStepIdx(steps.length - 1);
        }}
      />
    );
  }

  if (!step) return null;

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
          {steps.map((s) => (
            <StepNavItem
              key={s.idx}
              step={s}
              answers={answers}
              isActive={s.idx === currentStepIdx}
              onClick={() => {
                setCurrentStepIdx(s.idx);
                setFieldErrors({});
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </nav>

        {/* Save Progress button */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
          <button
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-colors"
          >
            {saveStatus === "saving" ? (
              <span className="text-gray-400">Saving…</span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Progress
              </>
            )}
          </button>
          {lastSavedAt && (
            <p className="text-xs text-center text-gray-400">
              {saveStatus === "saved" ? (
                <span className="text-green-600 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              ) : (
                `Last saved ${relativeTime}`
              )}
            </p>
          )}
        </div>

        {/* Generate Draft button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
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
            {steps.map((s) => (
              <div
                key={s.idx}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  s.idx < currentStepIdx ? "bg-green-500" : s.idx === currentStepIdx ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Step {currentStepIdx + 1} of {steps.length}
            </span>
            <div className="flex items-center gap-2">
              <span>{completeness.pct}% complete</span>
              <button
                onClick={handleManualSave}
                disabled={saveStatus === "saving"}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition-colors"
              >
                {saveStatus === "saving" ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Step header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
              Step {step.idx + 1} of {steps.length}
            </span>
            {/* Autosave indicator */}
            <span
              className={`ml-auto text-xs transition-opacity ${
                saveStatus === "idle" && !lastSavedAt ? "opacity-0" : "opacity-100"
              } ${saveStatus === "saved" ? "text-green-600" : "text-gray-400"}`}
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
              {saveStatus === "idle" && lastSavedAt && `Saved ${relativeTime}`}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{step.category}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Answer the questions below to help us draft your patent.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {step.questions.map((q, i) => (
            <DynamicQuestionBlock
              key={q.id}
              question={q}
              index={i}
              value={answers[q.id] ?? ""}
              onChange={(val) => updateAnswer(q.id, val)}
              error={fieldErrors[q.id]}
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
