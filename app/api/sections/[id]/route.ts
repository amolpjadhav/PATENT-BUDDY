import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";

// PATCH /api/sections/[id] — update a DraftSection's content
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  // [id] here is a DraftSection id — load section to get its projectId
  const section = await prisma.draftSection.findUnique({
    where: { id },
    select: { projectId: true, content: true },
  });
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify the section's project belongs to this user
  const project = await prisma.project.findUnique({
    where: { id: section.projectId },
    select: { userId: true },
  });
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content } = await req.json();
  const updated = await prisma.draftSection.update({
    where: { id },
    data: { content: content ?? section.content, updatedAt: new Date() },
  });

  return NextResponse.json({ section: updated });
}
