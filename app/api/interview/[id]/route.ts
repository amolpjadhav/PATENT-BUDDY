import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";
import { InterviewAnswers } from "@/types";

// PATCH /api/interview/[id] — save answers + step progress
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const owned = await prisma.project.findUnique({ where: { id }, select: { userId: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (owned.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
