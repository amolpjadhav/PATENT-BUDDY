"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ExportPageProps {
  projectId: string;
  projectTitle: string;
  hasDraft: boolean;
  claimsCount: number;
  sectionsCount: number;
  qualityErrorCount: number;
}

export function ExportPage({
  projectId,
  projectTitle,
  hasDraft,
  claimsCount,
  sectionsCount,
  qualityErrorCount,
}: ExportPageProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/export/${projectId}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_provisional.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {projectTitle}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Export Document</h1>
        <p className="text-sm text-gray-500 mt-1">Download your patent draft as a Microsoft Word document</p>
      </div>

      {!hasDraft ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No draft available to export yet.</p>
            <Link href={`/projects/${projectId}/draft`}>
              <Button>Generate Draft First</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary card */}
          <Card>
            <CardContent className="py-6">
              <h2 className="font-semibold text-gray-900 mb-4">Document Summary</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sections</dt>
                  <dd className="text-2xl font-bold text-gray-900">{sectionsCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">Claims</dt>
                  <dd className="text-2xl font-bold text-gray-900">{claimsCount}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Quality warning */}
          {qualityErrorCount > 0 && (
            <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="error">{qualityErrorCount} quality error{qualityErrorCount > 1 ? "s" : ""}</Badge>
              </div>
              <p className="text-sm text-orange-800">
                Your draft has quality issues. Consider fixing them before exporting.{" "}
                <Link href={`/projects/${projectId}/draft`} className="font-medium underline">
                  View issues →
                </Link>
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> This document is a draft for informational purposes only and is{" "}
              <strong>NOT legal advice</strong>. Have a registered patent attorney review before filing with the USPTO.
              The document will be marked <strong>CONFIDENTIAL</strong>.
            </p>
          </div>

          {/* What's included */}
          <Card>
            <CardContent className="py-6">
              <h2 className="font-semibold text-gray-900 mb-3">What&apos;s included in the DOCX</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  "Confidential header with invention title and inventor name",
                  "Field of the Invention",
                  "Background of the Invention",
                  "Summary of the Invention",
                  "Detailed Description of Embodiments",
                  "Abstract",
                  "Complete claim set (independent + dependent claims)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Download button */}
          <div className="flex items-center justify-between pt-2">
            <Link href={`/projects/${projectId}/draft`}>
              <Button variant="secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Draft First
              </Button>
            </Link>
            <Button onClick={handleDownload} loading={downloading} size="lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? "Preparing..." : "Download DOCX"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
