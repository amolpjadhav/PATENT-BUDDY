import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";

async function verifyOwnership(projectId: string, userId: string) {
  const owned = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  if (!owned) return "notfound";
  if (owned.userId !== userId) return "forbidden";
  return "ok";
}

// GET /api/projects/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const check = await verifyOwnership(id, userId);
  if (check === "notfound") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (check === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const check = await verifyOwnership(id, userId);
  if (check === "notfound") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (check === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const check = await verifyOwnership(id, userId);
  if (check === "notfound") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (check === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
