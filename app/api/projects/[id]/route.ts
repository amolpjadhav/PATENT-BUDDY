import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionIdsFromRequest } from "@/lib/session";

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

// GET /api/projects/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sessionIds(req).includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      answers: true,
      sections: true,
      qualityIssues: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
}

// PATCH /api/projects/[id] — update title or jurisdiction
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sessionIds(req).includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.project.update({
    where: { id },
    data: {
      title: body.title ?? undefined,
      jurisdiction: body.jurisdiction ?? undefined,
    },
  });
  return NextResponse.json({ project: updated });
}

// DELETE /api/projects/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ids = sessionIds(req);
  if (!ids.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id } });

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    "patent_buddy_session",
    JSON.stringify(ids.filter((x) => x !== id)),
    { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" }
  );
  return response;
}
