"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STEPS = [
  { label: "Reading your invention notes…", minMs: 0 },
  { label: "Extracting key concepts and components…", minMs: 5000 },
  { label: "Generating tailored interview questions…", minMs: 20000 },
];

interface InterviewLoadingScreenProps {
  projectId: string;
}

export function InterviewLoadingScreen({ projectId }: InterviewLoadingScreenProps) {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Advance the progress label every few seconds while waiting
    const timers = STEPS.slice(1).map((s, i) =>
      setTimeout(() => {
        if (!cancelled) setStepIdx(i + 1);
      }, s.minMs)
    );

    // Call the generation endpoint
    fetch(`/api/projects/${projectId}/generate-questions`, { method: "POST" })
      .then(async (res) => {
        if (cancelled) return;
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Question generation failed");
        // Refresh the page — server component will now route to DynamicInterviewWizard
        router.replace(`/projects/${projectId}/interview`);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setGenerating(false);
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          {generating ? (
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {generating ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analysing Your Invention</h2>
            <p className="text-sm text-gray-500 mb-8">
              Our AI is studying your notes and generating a personalised set of interview questions. This usually takes 20–40 seconds.
            </p>

            {/* Step progress */}
            <div className="space-y-3 text-left mb-8">
              {STEPS.map((s, i) => {
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                  <div key={i} className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${active ? "bg-blue-50 border border-blue-200" : done ? "bg-green-50" : "bg-white border border-gray-100"}`}>
                    <div className="flex-shrink-0 w-5 h-5">
                      {done ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : active ? (
                        <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                    <span className={`text-sm ${active ? "text-blue-800 font-medium" : done ? "text-green-700" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400">Please keep this tab open while we work.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setError(""); setGenerating(true); setStepIdx(0); }}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href={`/projects/${projectId}`}
                className="text-sm text-gray-500 hover:text-gray-700 text-center"
              >
                ← Back to Project
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
