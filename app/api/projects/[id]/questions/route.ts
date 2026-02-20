import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionIdsFromRequest } from "@/lib/session";

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!sessionIds(req).includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const questions = await prisma.interviewQuestion.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ questions });
}
