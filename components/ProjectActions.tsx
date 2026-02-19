"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ProjectActionsProps {
  projectId: string;
}

export function ProjectActions({ projectId }: ProjectActionsProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      router.push("/");
    } catch {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm text-gray-600">Delete this project?</span>
        <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
          Yes, delete
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setShowConfirm(true)} className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      Delete
    </Button>
  );
}
