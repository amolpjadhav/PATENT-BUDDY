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

// PATCH /api/sections/[id] - update section content
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokens = getTokenList(req);

  const section = await prisma.section.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!section || !tokens.includes(section.project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  const updated = await prisma.section.update({
    where: { id },
    data: {
      content: body.content ?? section.content,
      title: body.title ?? section.title,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ section: updated });
}
