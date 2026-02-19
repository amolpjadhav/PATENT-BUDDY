"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [inventorName, setInventorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter an invention title");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), inventorName: inventorName.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create project");
      }

      const { project } = await res.json();
      router.push(`/projects/${project.id}/interview`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
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
            Give your invention a working title. You can refine it later.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-5">
            <Input
              id="title"
              label="Invention Title"
              hint="A short name for your invention, e.g. 'Self-Watering Plant Pot System'"
              placeholder="My Invention"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />

            <Input
              id="inventorName"
              label="Inventor Name (optional)"
              hint="Your full legal name as it will appear on the application"
              placeholder="Jane Smith"
              value={inventorName}
              onChange={(e) => setInventorName(e.target.value)}
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link href="/">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={loading}>
                Create Project & Start Interview
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>What happens next:</strong> You&apos;ll go through a 5-step interview about your invention.
          It takes about 10-15 minutes. At the end, we generate your draft document automatically.
        </p>
      </div>
    </main>
  );
}
