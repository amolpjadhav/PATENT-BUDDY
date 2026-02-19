"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SECTION_ORDER, SECTION_LABELS, type SectionKey, type QualityIssueRow, type DraftSectionRow } from "@/types";

interface DraftEditorProps {
  projectId: string;
  projectTitle: string;
  interviewComplete: boolean;
  initialSections: DraftSectionRow[];
  initialQualityIssues: QualityIssueRow[];
  qualityCheckedAt: Date | null;
}

export function DraftEditor({
  projectId,
  projectTitle,
  interviewComplete,
  initialSections,
  initialQualityIssues,
  qualityCheckedAt,
}: DraftEditorProps) {
  const router = useRouter();
  const [sections, setSections] = useState<DraftSectionRow[]>(initialSections);
  const [qualityIssues, setQualityIssues] = useState<QualityIssueRow[]>(initialQualityIssues);
  const [generating, setGenerating] = useState(false);
  const [runningQuality, setRunningQuality] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sections" | "quality">("sections");
  const [error, setError] = useState("");

  const hasDraft = sections.length > 0;

  // Sort sections in canonical order
  const orderedSections = [...sections].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.sectionKey as SectionKey);
    const bi = SECTION_ORDER.indexOf(b.sectionKey as SectionKey);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const highCount = qualityIssues.filter((i) => i.severity === "HIGH").length;
  const medCount  = qualityIssues.filter((i) => i.severity === "MED").length;
  const lowCount  = qualityIssues.filter((i) => i.severity === "LOW").length;

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/generate/${projectId}`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Generation failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveSection(sectionId: string, content: string) {
    setSavingId(sectionId);
    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Save failed");
      const { section } = await res.json();
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...section } : s)));
      setEditingId(null);
    } catch {
      setError("Failed to save section");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRunQuality() {
    setRunningQuality(true);
    setError("");
    try {
      const res = await fetch(`/api/quality/${projectId}`, { method: "POST" });
      if (!res.ok) throw new Error("Quality check failed");
      const { issues } = await res.json();
      setQualityIssues(issues);
      setActiveTab("quality");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quality check failed");
    } finally {
      setRunningQuality(false);
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!hasDraft) {
    return (
      <div>
        <div className="mb-6">
          <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {projectTitle}
          </Link>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Draft Yet</h2>
            <p className="text-gray-500 mb-6">
              {interviewComplete ? "Interview complete — generate your draft now." : "Complete the interview first."}
            </p>
            {interviewComplete ? (
              <>
                {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 max-w-md mx-auto">{error}</div>}
                <Button onClick={handleGenerate} loading={generating} size="lg">
                  {generating ? "Generating…" : "Generate Draft"}
                </Button>
                {generating && <p className="mt-3 text-sm text-gray-500">This takes 30–60 seconds…</p>}
              </>
            ) : (
              <Link href={`/projects/${projectId}/interview`}><Button>Go to Interview</Button></Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Draft editor ──────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {projectTitle}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Draft Document</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sections.length} sections</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <Button variant="secondary" size="sm" onClick={handleRunQuality} loading={runningQuality}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Quality Check
          </Button>
          <Link href={`/projects/${projectId}/export`}>
            <Button size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export DOCX
            </Button>
          </Link>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Quality summary bar */}
      {qualityIssues.length > 0 && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 flex items-center justify-between cursor-pointer ${highCount > 0 ? "bg-red-50 border-red-200" : medCount > 0 ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"}`}
          onClick={() => setActiveTab("quality")}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">Quality Check</span>
            {highCount > 0 && <Badge variant="error">{highCount} HIGH</Badge>}
            {medCount > 0 && <Badge variant="warning">{medCount} MED</Badge>}
            {lowCount > 0 && <Badge variant="info">{lowCount} LOW</Badge>}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">View →</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(["sections", "quality"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab === "sections" && `Sections (${sections.length})`}
            {tab === "quality" && (
              <span className="flex items-center gap-1.5">
                Quality
                {qualityIssues.length > 0 && (
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center text-white ${highCount > 0 ? "bg-red-500" : "bg-orange-400"}`}>
                    {qualityIssues.length}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sections tab */}
      {activeTab === "sections" && (
        <div className="space-y-4">
          {orderedSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              isEditing={editingId === section.id}
              isSaving={savingId === section.id}
              onEdit={() => setEditingId(section.id)}
              onCancel={() => setEditingId(null)}
              onSave={(content) => handleSaveSection(section.id, content)}
            />
          ))}
        </div>
      )}

      {/* Quality tab */}
      {activeTab === "quality" && (
        <div>
          {qualityIssues.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {qualityCheckedAt ? "No issues found" : "Run a quality check"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {qualityCheckedAt
                    ? "Your draft looks good. Have a patent attorney review before filing."
                    : "Check for antecedent basis, missing support, and term consistency."}
                </p>
                <Button onClick={handleRunQuality} loading={runningQuality} variant="secondary">
                  {runningQuality ? "Running…" : "Run Quality Check"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...qualityIssues]
                .sort((a, b) => {
                  const order = { HIGH: 0, MED: 1, LOW: 2 };
                  return (order[a.severity as keyof typeof order] ?? 9) - (order[b.severity as keyof typeof order] ?? 9);
                })
                .map((issue) => (
                  <QualityIssueCard key={issue.id} issue={issue} />
                ))}
              <div className="pt-2">
                <Button onClick={handleRunQuality} loading={runningQuality} variant="secondary" size="sm">
                  Re-run Quality Check
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({
  section,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: {
  section: DraftSectionRow;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (content: string) => void;
}) {
  const [draft, setDraft] = useState(section.content);
  const label = SECTION_LABELS[section.sectionKey as SectionKey] ?? section.sectionKey;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{section.sectionKey}</span>
            <h3 className="font-semibold text-gray-900">{label}</h3>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.max(6, draft.split("\n").length + 2)}
              className="font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button size="sm" loading={isSaving} onClick={() => onSave(draft)}>Save</Button>
              <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {section.content.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-gray-700 mb-3 last:mb-0 whitespace-pre-wrap">{para.trim()}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Quality issue card ────────────────────────────────────────────────────────
function QualityIssueCard({ issue }: { issue: QualityIssueRow }) {
  const severityStyles = {
    HIGH: { border: "border-red-200 bg-red-50", badge: "error" as const, icon: "✕" },
    MED:  { border: "border-orange-200 bg-orange-50", badge: "warning" as const, icon: "⚠" },
    LOW:  { border: "border-blue-200 bg-blue-50", badge: "info" as const, icon: "ℹ" },
  };
  const styles = severityStyles[issue.severity as keyof typeof severityStyles] ?? severityStyles.LOW;

  let location = "";
  try { location = (JSON.parse(issue.metadata) as { location?: string }).location ?? ""; } catch { /* noop */ }

  return (
    <Card className={`border ${styles.border}`}>
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${issue.severity === "HIGH" ? "bg-red-100" : issue.severity === "MED" ? "bg-orange-100" : "bg-blue-100"}`}>
            <span className="text-xs">{styles.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant={styles.badge}>{issue.severity}</Badge>
              <Badge variant="default">{issue.type.replace(/_/g, " ")}</Badge>
              {location && <span className="text-xs text-gray-400">{location}</span>}
            </div>
            <p className="text-sm text-gray-800">{issue.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
