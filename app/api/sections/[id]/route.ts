import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionIdsFromRequest } from "@/lib/session";

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

// PATCH /api/sections/[id] — update a DraftSection's content
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const section = await prisma.draftSection.findUnique({
    where: { id },
    select: { projectId: true, content: true },
  });

  if (!section || !sessionIds(req).includes(section.projectId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { content } = await req.json();
  const updated = await prisma.draftSection.update({
    where: { id },
    data: { content: content ?? section.content, updatedAt: new Date() },
  });

  return NextResponse.json({ section: updated });
}
