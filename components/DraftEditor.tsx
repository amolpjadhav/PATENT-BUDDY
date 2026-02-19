"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QualityIssue } from "@/types";

interface Section {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  updatedAt: Date;
}

interface Claim {
  id: string;
  number: number;
  claimType: string;
  content: string;
  dependsOn: number | null;
  updatedAt: Date;
}

interface DraftEditorProps {
  projectId: string;
  projectTitle: string;
  interviewComplete: boolean;
  initialSections: Section[];
  initialClaims: Claim[];
  initialQualityIssues: QualityIssue[];
  qualityCheckRunAt: Date | null;
}

export function DraftEditor({
  projectId,
  projectTitle,
  interviewComplete,
  initialSections,
  initialClaims,
  initialQualityIssues,
  qualityCheckRunAt,
}: DraftEditorProps) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>(initialQualityIssues);
  const [generating, setGenerating] = useState(false);
  const [runningQuality, setRunningQuality] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingClaim, setEditingClaim] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sections" | "claims" | "quality">("sections");
  const [error, setError] = useState("");

  const hasDraft = sections.length > 0;

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/generate/${projectId}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }
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
      setEditingSection(null);
    } catch {
      setError("Failed to save section");
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveClaim(claimId: string, content: string) {
    setSavingId(claimId);
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Save failed");
      const { claim } = await res.json();
      setClaims((prev) => prev.map((c) => (c.id === claimId ? { ...c, ...claim } : c)));
      setEditingClaim(null);
    } catch {
      setError("Failed to save claim");
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

  const errorIssues = qualityIssues.filter((i) => i.severity === "error");
  const warningIssues = qualityIssues.filter((i) => i.severity === "warning");
  const infoIssues = qualityIssues.filter((i) => i.severity === "info");

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
              {interviewComplete
                ? "Your interview is complete. Generate your patent draft now."
                : "Complete the interview first, then generate your draft."}
            </p>
            {interviewComplete ? (
              <div>
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 max-w-md mx-auto">
                    {error}
                  </div>
                )}
                <Button onClick={handleGenerate} loading={generating} size="lg">
                  {generating ? "Generating..." : "Generate Draft"}
                </Button>
                {generating && (
                  <p className="mt-3 text-sm text-gray-500">This takes 30-60 seconds...</p>
                )}
              </div>
            ) : (
              <Link href={`/projects/${projectId}/interview`}>
                <Button>Go to Interview</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <p className="text-sm text-gray-500 mt-0.5">
            {sections.length} sections · {claims.length} claims
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunQuality}
            loading={runningQuality}
          >
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

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Quality issues summary bar */}
      {qualityIssues.length > 0 && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 flex items-center justify-between cursor-pointer ${
            errorIssues.length > 0
              ? "bg-red-50 border-red-200"
              : warningIssues.length > 0
              ? "bg-orange-50 border-orange-200"
              : "bg-blue-50 border-blue-200"
          }`}
          onClick={() => setActiveTab("quality")}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">Quality Check</span>
            {errorIssues.length > 0 && (
              <Badge variant="error">{errorIssues.length} error{errorIssues.length > 1 ? "s" : ""}</Badge>
            )}
            {warningIssues.length > 0 && (
              <Badge variant="warning">{warningIssues.length} warning{warningIssues.length > 1 ? "s" : ""}</Badge>
            )}
            {infoIssues.length > 0 && (
              <Badge variant="info">{infoIssues.length} suggestion{infoIssues.length > 1 ? "s" : ""}</Badge>
            )}
          </div>
          <span className="text-xs text-gray-500">Click to view →</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(["sections", "claims", "quality"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "sections" && `Sections (${sections.length})`}
            {tab === "claims" && `Claims (${claims.length})`}
            {tab === "quality" && (
              <span className="flex items-center gap-1">
                Quality
                {qualityIssues.length > 0 && (
                  <span
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center text-white ${
                      errorIssues.length > 0 ? "bg-red-500" : "bg-orange-400"
                    }`}
                  >
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
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              isEditing={editingSection === section.id}
              isSaving={savingId === section.id}
              onEdit={() => setEditingSection(section.id)}
              onCancel={() => setEditingSection(null)}
              onSave={(content) => handleSaveSection(section.id, content)}
            />
          ))}
        </div>
      )}

      {/* Claims tab */}
      {activeTab === "claims" && (
        <div className="space-y-3">
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Claims define the scope of your patent protection.</strong> Claim 1 is typically the broadest
              independent claim. Review each claim carefully and edit to match your actual invention.
            </p>
          </div>
          {claims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              isEditing={editingClaim === claim.id}
              isSaving={savingId === claim.id}
              onEdit={() => setEditingClaim(claim.id)}
              onCancel={() => setEditingClaim(null)}
              onSave={(content) => handleSaveClaim(claim.id, content)}
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
                  {qualityCheckRunAt ? "No issues found!" : "Run a quality check"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {qualityCheckRunAt
                    ? "Your draft looks good. Consider having a patent attorney review before filing."
                    : "Check for antecedent basis issues, missing support, and term consistency."}
                </p>
                <Button onClick={handleRunQuality} loading={runningQuality} variant="secondary">
                  {runningQuality ? "Running..." : "Run Quality Check"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...errorIssues, ...warningIssues, ...infoIssues].map((issue, i) => (
                <Card
                  key={i}
                  className={
                    issue.severity === "error"
                      ? "border-red-200"
                      : issue.severity === "warning"
                      ? "border-orange-200"
                      : "border-blue-200"
                  }
                >
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          issue.severity === "error"
                            ? "bg-red-100"
                            : issue.severity === "warning"
                            ? "bg-orange-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <span className="text-xs">
                          {issue.severity === "error" ? "✕" : issue.severity === "warning" ? "⚠" : "ℹ"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              issue.severity === "error"
                                ? "error"
                                : issue.severity === "warning"
                                ? "warning"
                                : "info"
                            }
                          >
                            {issue.severity}
                          </Badge>
                          <Badge variant="default">{issue.category.replace(/_/g, " ")}</Badge>
                          {issue.location && (
                            <span className="text-xs text-gray-400">{issue.location}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800">{issue.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

// Section edit card
function SectionCard({
  section,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: {
  section: Section;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (content: string) => void;
}) {
  const [draft, setDraft] = useState(section.content);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {section.type.replace(/_/g, " ")}
            </span>
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
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
              <Button size="sm" loading={isSaving} onClick={() => onSave(draft)}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {section.content.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-gray-700 mb-3 last:mb-0 whitespace-pre-wrap">
                {para.trim()}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Claim edit card
function ClaimCard({
  claim,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: {
  claim: Claim;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (content: string) => void;
}) {
  const [draft, setDraft] = useState(claim.content);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
            {claim.number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={claim.claimType === "independent" ? "info" : "default"}>
                {claim.claimType}
              </Badge>
              {claim.dependsOn && (
                <span className="text-xs text-gray-400">depends on claim {claim.dependsOn}</span>
              )}
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={onEdit} className="ml-auto">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={Math.max(4, draft.split("\n").length + 1)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" loading={isSaving} onClick={() => onSave(draft)}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">{claim.content}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
