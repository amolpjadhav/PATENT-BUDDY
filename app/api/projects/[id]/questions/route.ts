import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const owned = await prisma.project.findUnique({ where: { id }, select: { userId: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (owned.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const questions = await prisma.interviewQuestion.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ questions });
}
