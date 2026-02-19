import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionIdsFromRequest } from "@/lib/session";
import { InterviewAnswers } from "@/types";

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

// PATCH /api/interview/[id] — save answers + step progress
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sessionIds(req).includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const answers: InterviewAnswers = body.answers ?? {};
  const currentStep: number = body.currentStep ?? 0;
  const completed: boolean = body.completed ?? false;

  // Upsert each answer as an individual InterviewAnswer row
  const upserts = Object.entries(answers).map(([questionKey, answer]) =>
    prisma.interviewAnswer.upsert({
      where: { projectId_questionKey: { projectId: id, questionKey } },
      create: { projectId: id, questionKey, answer: String(answer ?? ""), updatedAt: new Date() },
      update: { answer: String(answer ?? ""), updatedAt: new Date() },
    })
  );

  await Promise.all(upserts);

  // Update wizard progress on Project
  const project = await prisma.project.update({
    where: { id },
    data: { interviewStep: currentStep, interviewCompleted: completed },
  });

  return NextResponse.json({ project });
}
