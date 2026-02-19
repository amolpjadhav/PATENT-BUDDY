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

// GET /api/projects/[id] - get full project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      interview: true,
      sections: { orderBy: { order: "asc" } },
      claims: { orderBy: { number: "asc" } },
      qualityCheck: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Check access via token
  const tokens = getTokenList(req);
  if (!tokens.includes(project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ project });
}

// PATCH /api/projects/[id] - update project metadata
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokens = getTokenList(req);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || !tokens.includes(project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.project.update({
    where: { id },
    data: {
      title: body.title ?? undefined,
      inventorName: body.inventorName ?? undefined,
      status: body.status ?? undefined,
    },
  });

  return NextResponse.json({ project: updated });
}

// DELETE /api/projects/[id] - delete project
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokens = getTokenList(req);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || !tokens.includes(project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id } });

  // Remove token from session
  const updatedTokens = tokens.filter((t) => t !== project.token);
  const response = NextResponse.json({ success: true });
  response.cookies.set("patent_buddy_session", JSON.stringify(updatedTokens), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
