"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/Card";
import { InterviewAnswers } from "@/types";

interface StepField {
  key: keyof InterviewAnswers;
  label: string;
  type: "input" | "textarea";
  placeholder: string;
  hint: string;
  required?: boolean;
  rows?: number;
}

interface Step {
  id: number;
  title: string;
  description: string;
  fields: StepField[];
}

interface InterviewWizardProps {
  projectId: string;
  projectTitle: string;
  initialAnswers: InterviewAnswers;
  initialStep: number;
  completed: boolean;
}

const STEPS: Step[] = [
  {
    id: 0,
    title: "What's your invention?",
    description: "Let's start with the basics about your invention.",
    fields: [
      {
        key: "inventionTitle" as keyof InterviewAnswers,
        label: "Invention Title",
        type: "input",
        placeholder: "e.g., Self-Watering Plant Pot System",
        hint: "A clear, descriptive name for your invention",
        required: true,
      },
      {
        key: "inventionField" as keyof InterviewAnswers,
        label: "Field of the Invention",
        type: "input",
        placeholder: "e.g., Horticultural equipment, Water management systems",
        hint: "The technical area your invention belongs to",
        required: true,
      },
      {
        key: "problemSolved" as keyof InterviewAnswers,
        label: "What problem does your invention solve?",
        type: "textarea",
        placeholder: "Describe the problem or need that motivated this invention. What frustration or inefficiency does it address?",
        hint: "Be specific about the pain point",
        required: true,
        rows: 4,
      },
    ],
  },
  {
    id: 1,
    title: "How does it work?",
    description: "Describe the technical details of your invention — components, materials, and how they work together.",
    fields: [
      {
        key: "howItWorks" as keyof InterviewAnswers,
        label: "How does your invention work?",
        type: "textarea",
        placeholder: "Describe the mechanism or process. Walk us through how a user would interact with it, or how the system operates step by step.",
        hint: "Be as detailed as possible — this becomes the core of your specification",
        required: true,
        rows: 6,
      },
      {
        key: "keyComponents" as keyof InterviewAnswers,
        label: "What are the key components or elements?",
        type: "textarea",
        placeholder: "List and briefly describe each major component, e.g.:\n- Water reservoir (holds 2L of water)\n- Sensor module (detects soil moisture)\n- Drip valve (releases water when soil is dry)",
        hint: "Give each component a consistent name — you'll use these throughout the application",
        required: true,
        rows: 5,
      },
      {
        key: "keySteps" as keyof InterviewAnswers,
        label: "If it's a method/process, what are the key steps?",
        type: "textarea",
        placeholder: "e.g.:\n1. User fills reservoir\n2. Sensor measures soil moisture every hour\n3. When moisture drops below threshold, valve opens\n4. Water drips until threshold is met",
        hint: "Skip this if your invention is purely a device/structure",
        rows: 4,
      },
      {
        key: "materials" as keyof InterviewAnswers,
        label: "Materials, substances, or software involved",
        type: "textarea",
        placeholder: "e.g., High-density polyethylene (HDPE) reservoir, capacitive moisture sensor, Arduino microcontroller, silicone tubing",
        hint: "List key materials, software platforms, or technologies used",
        rows: 3,
      },
    ],
  },
  {
    id: 2,
    title: "What makes it novel?",
    description: "Tell us what's new and better about your invention compared to what already exists.",
    fields: [
      {
        key: "novelAspects" as keyof InterviewAnswers,
        label: "What is genuinely new about your invention?",
        type: "textarea",
        placeholder: "What has never been done before, or what combination of features is new? Be specific.",
        hint: "This is the most important section for patent protection",
        required: true,
        rows: 4,
      },
      {
        key: "advantages" as keyof InterviewAnswers,
        label: "What advantages does it provide?",
        type: "textarea",
        placeholder: "e.g., Saves 60% water vs. manual watering, works without electricity, installable by non-experts in 5 minutes",
        hint: "Quantify advantages where possible",
        required: true,
        rows: 4,
      },
      {
        key: "differentiators" as keyof InterviewAnswers,
        label: "How is it different from existing products or patents?",
        type: "textarea",
        placeholder: "Describe similar products/patents you know of and how yours differs. If you don't know of any, say 'None known to inventor.'",
        hint: "Honest disclosure of known prior art helps attorneys later",
        rows: 3,
      },
    ],
  },
  {
    id: 3,
    title: "Embodiments & variations",
    description: "Describe the main version of your invention and any alternatives or optional features.",
    fields: [
      {
        key: "primaryEmbodiment" as keyof InterviewAnswers,
        label: "Describe your primary embodiment",
        type: "textarea",
        placeholder: "Describe the best, most complete version of your invention as you envision it right now. Include specific dimensions, values, or configurations if known.",
        hint: "The 'best mode' — the version you'd actually build first",
        required: true,
        rows: 5,
      },
      {
        key: "alternativeEmbodiments" as keyof InterviewAnswers,
        label: "What alternative versions or configurations exist?",
        type: "textarea",
        placeholder: "e.g.:\n- A version without electronics that uses a float valve instead\n- A version for outdoor use with UV-resistant materials\n- A commercial-scale version for greenhouses",
        hint: "Alternative embodiments broaden your patent protection",
        rows: 4,
      },
      {
        key: "optionalFeatures" as keyof InterviewAnswers,
        label: "What optional or additional features could be added?",
        type: "textarea",
        placeholder: "e.g., Smartphone app for remote monitoring, fertilizer dispenser module, solar-powered charging",
        hint: "Features that enhance but aren't essential to the core invention",
        rows: 3,
      },
    ],
  },
  {
    id: 4,
    title: "Context & use",
    description: "Help us understand who uses your invention, where, and any relevant prior art.",
    fields: [
      {
        key: "targetUsers" as keyof InterviewAnswers,
        label: "Who are the target users?",
        type: "input",
        placeholder: "e.g., Home gardeners, apartment dwellers, commercial greenhouses",
        hint: "Who will buy and use this invention?",
      },
      {
        key: "useEnvironment" as keyof InterviewAnswers,
        label: "Where and how is it used?",
        type: "input",
        placeholder: "e.g., Indoor use with standard potted plants, outdoor gardens, hydroponic systems",
        hint: "The environment or context of use",
      },
      {
        key: "priorArtKnown" as keyof InterviewAnswers,
        label: "Do you know of any relevant prior patents or products?",
        type: "input",
        placeholder: "Yes / No / Unsure",
        hint: "Even 'No' is a valid answer",
      },
      {
        key: "priorArtDescription" as keyof InterviewAnswers,
        label: "If yes, briefly describe what you know",
        type: "textarea",
        placeholder: "e.g., US Patent 9,999,999 by Smith describes a self-watering pot but requires a power outlet. Our system works without electricity.",
        hint: "Include patent numbers or product names if known",
        rows: 3,
      },
    ],
  },
];

export function InterviewWizard({
  projectId,
  projectTitle,
  initialAnswers,
  initialStep,
  completed: initialCompleted,
}: InterviewWizardProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<InterviewAnswers>(initialAnswers);
  const [currentStep, setCurrentStep] = useState(initialCompleted ? STEPS.length : initialStep);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isComplete = currentStep >= STEPS.length;

  const updateAnswer = useCallback((key: keyof InterviewAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function saveProgress(step: number, complete = false) {
    await fetch(`/api/interview/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        currentStep: step,
        completed: complete,
      }),
    });
  }

  async function handleNext() {
    const requiredFields = step?.fields.filter((f) => f.required) ?? [];
    for (const field of requiredFields) {
      if (!answers[field.key]?.trim()) {
        setError(`Please fill in: ${field.label}`);
        return;
      }
    }

    setError("");
    setSaving(true);
    try {
      const nextStep = currentStep + 1;
      const complete = nextStep >= STEPS.length;
      await saveProgress(nextStep, complete);
      setCurrentStep(nextStep);
    } finally {
      setSaving(false);
    }
  }

  async function handleBack() {
    setSaving(true);
    try {
      await saveProgress(currentStep - 1);
      setCurrentStep((s) => s - 1);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/generate/${projectId}`, {
        method: "POST",
      });
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

  // Completion screen
  if (isComplete) {
    return (
      <div>
        <div className="mb-6">
          <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Project
          </Link>
        </div>

        <Card>
          <CardContent className="py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Great work. Now we&apos;ll use your answers to generate a complete provisional patent draft including all
              sections and a claim set.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 max-w-md mx-auto">
                {error}
                {error.includes("API key") && (
                  <p className="mt-1">Please set your OPENAI_API_KEY in .env and restart the server.</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleGenerate} loading={generating} size="lg">
                {generating ? "Generating your draft..." : "Generate Patent Draft"}
                {!generating && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </Button>
              <Button variant="secondary" onClick={() => setCurrentStep(STEPS.length - 1)}>
                Review Answers
              </Button>
            </div>

            {generating && (
              <p className="mt-4 text-sm text-gray-500">
                This usually takes 30-60 seconds. Please don&apos;t close the tab.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {projectTitle}
        </Link>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                i < currentStep
                  ? "bg-green-500"
                  : i === currentStep
                  ? "bg-blue-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{step.description}</p>
        </CardHeader>

        <CardContent>
          <div className="space-y-5">
            {step.fields.map((field) => (
              <div key={field.key}>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    label={field.label + (field.required ? " *" : "")}
                    hint={field.hint}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 4}
                    value={answers[field.key] ?? ""}
                    onChange={(e) => updateAnswer(field.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={field.key}
                    label={field.label + (field.required ? " *" : "")}
                    hint={field.hint}
                    placeholder={field.placeholder}
                    value={answers[field.key] ?? ""}
                    onChange={(e) => updateAnswer(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0 || saving}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full ${
                    i === currentStep ? "bg-blue-500" : i < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} loading={saving}>
              {isLastStep ? "Finish Interview" : "Next"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Tips */}
      <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Your progress is saved automatically as you move between steps. You can close and return
          anytime.
        </p>
      </div>
    </div>
  );
}
