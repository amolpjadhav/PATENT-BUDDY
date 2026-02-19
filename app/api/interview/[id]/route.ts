import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getTokenList(req: NextRequest): string[] {
  const raw = req.cookies.get("patent_buddy_session")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// PATCH /api/interview/[id] - save interview progress
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokens = getTokenList(req);

  const project = await prisma.project.findUnique({
    where: { id },
    include: { interview: true },
  });

  if (!project || !tokens.includes(project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { answers, currentStep, completed } = body;

  if (!project.interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  const interview = await prisma.interview.update({
    where: { projectId: id },
    data: {
      answers: JSON.stringify(answers ?? {}),
      currentStep: currentStep ?? project.interview.currentStep,
      completed: completed ?? project.interview.completed,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ interview });
}
