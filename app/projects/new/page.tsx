"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaType(file: File): "VIDEO" | "AUDIO" {
  return file.type.startsWith("video/") ? "VIDEO" : "AUDIO";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [intakeNotes, setIntakeNotes] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState("");
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = loadingStep !== null;

  function addMediaFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files).filter(
      (f) => f.type.startsWith("audio/") || f.type.startsWith("video/")
    );
    setMediaFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      return [...prev, ...incoming.filter((f) => !existing.has(`${f.name}-${f.size}`))];
    });
    // Reset the input so the same file can be re-added after removal
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  }

  function removeMediaFile(index: number) {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) { setError("Please enter a project name."); return; }
    if (intakeNotes.trim().length < 50) { setError("Please describe your invention in at least 50 characters."); return; }

    setError("");
    try {
      // Step 1: Create project
      setLoadingStep("Creating project…");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), intakeNotes: intakeNotes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create project");
      const projectId = data?.project?.id;
      if (!projectId) throw new Error("Server did not return project id");

      // Step 2: Upload PDF (optional)
      if (pdfFile) {
        setLoadingStep("Uploading PDF…");
        const form = new FormData();
        form.append("type", "PDF");
        form.append("file", pdfFile);
        await fetch(`/api/projects/${projectId}/artifacts`, { method: "POST", body: form });
      }

      // Step 3: Upload audio / video files (optional)
      for (let i = 0; i < mediaFiles.length; i++) {
        const f = mediaFiles[i];
        const label = mediaType(f) === "VIDEO" ? "video" : "audio";
        setLoadingStep(
          mediaFiles.length === 1
            ? `Uploading ${label} file…`
            : `Uploading ${label} file ${i + 1} of ${mediaFiles.length}…`
        );
        const form = new FormData();
        form.append("type", mediaType(f));
        form.append("file", f);
        await fetch(`/api/projects/${projectId}/artifacts`, { method: "POST", body: form });
      }

      setLoadingStep("Redirecting…");
      router.push(`/projects/${projectId}/interview`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingStep(null);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-gray-900">Start a New Patent Project</h1>
          <p className="text-sm text-gray-500 mt-1">
            Describe your invention in plain language. Our AI will analyse your notes and generate a tailored set of interview questions.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">

            {/* Project name */}
            <Input
              id="title"
              label="Project Name *"
              hint="A short working title, e.g. 'Self-Watering Plant Pot System'"
              placeholder="My Invention"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              disabled={isSubmitting}
            />

            {/* Invention notes */}
            <div className="space-y-1.5">
              <label htmlFor="intakeNotes" className="block text-sm font-medium text-gray-700">
                Invention Notes <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">
                Describe your invention in plain English — the problem it solves, how it works, what makes it new, and any key components or steps.
              </p>
              <Textarea
                id="intakeNotes"
                rows={8}
                placeholder={"Describe your invention in plain English…\n\nFor example:\n• What problem does it solve?\n• How does it work?\n• What makes it new or different?\n• Key components or steps"}
                value={intakeNotes}
                onChange={(e) => setIntakeNotes(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400 text-right">{intakeNotes.trim().length} chars (min 50)</p>
            </div>

            {/* PDF upload */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">
                Upload PDF <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <p className="text-xs text-gray-500">
                Technical specification, prior disclosure, or any document describing your invention.
              </p>
              <label
                className={`flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 cursor-pointer transition-colors ${
                  pdfFile ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                } ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
              >
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-600 flex-1 truncate">
                  {pdfFile ? pdfFile.name : "Choose a PDF file…"}
                </span>
                {pdfFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setPdfFile(null); }}
                    className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    Remove
                  </button>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  disabled={isSubmitting}
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {/* Audio / Video upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Audio / Video Files <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <p className="text-xs text-gray-500">
                Upload voice notes, screen recordings, or video demos of your invention. We&apos;ll transcribe and include them in the analysis.
              </p>

              {/* Selected file list */}
              {mediaFiles.length > 0 && (
                <ul className="space-y-2">
                  {mediaFiles.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${mediaType(f) === "VIDEO" ? "bg-violet-50" : "bg-purple-50"}`}>
                        {mediaType(f) === "VIDEO" ? (
                          <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </div>

                      {/* Name + size */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                        <p className="text-xs text-gray-400">
                          {mediaType(f) === "VIDEO" ? "Video" : "Audio"} · {fmtSize(f.size)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeMediaFile(i)}
                        disabled={isSubmitting}
                        className="text-gray-300 hover:text-gray-500 disabled:opacity-50 transition-colors flex-shrink-0"
                        aria-label={`Remove ${f.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add files button */}
              <label
                className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSubmitting ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {mediaFiles.length > 0 ? "Add more files" : "Choose audio or video files"}
                </span>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  multiple
                  className="sr-only"
                  disabled={isSubmitting}
                  onChange={(e) => addMediaFiles(e.target.files)}
                />
              </label>
              <p className="text-xs text-gray-400">Supports MP4, MOV, WebM, MP3, WAV, M4A, and more</p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Loading progress */}
            {isSubmitting && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-center gap-3">
                <svg className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-sm text-blue-700 font-medium">{loadingStep}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link href="/"><Button variant="ghost" type="button" disabled={isSubmitting}>Cancel</Button></Link>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                Create Project &amp; Generate Questions
                {!isSubmitting && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </main>
  );
}
